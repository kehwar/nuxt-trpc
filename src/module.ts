import { addTemplate, addTypeTemplate, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import { init, parse } from 'es-module-lexer'
import fg from 'fast-glob'
import _ from 'lodash'
import * as path from 'pathe'
import type { Plugin } from 'vite'

const defaultModuleOptions = {
  pattern: '**/*.trpc.{ts,js,mjs}',
  queryPrefixes: [
    'access',
    'acquire',
    'download',
    'fetch',
    'get',
    'list',
    'obtain',
    'pull',
    'read',
    'retrieve',
    'select',
  ],
  mutationPrefixes: [
    'add',
    'append',
    'create',
    'delete',
    'modify',
    'post',
    'process',
    'push',
    'send',
    'submit',
    'update',
    'upload',
    'write',
  ],
  subscriptionPrefixes: ['subscribe'],
  defaultAction: 'query' as 'query' | 'mutation' | 'subscription' | 'error',
  inject: {
    router: 'fixtures/trpc/src/define-trpc-router',
  },
}
type ModuleOptions = typeof defaultModuleOptions
type Options = ModuleOptions & {
  cwd: string
}

export default defineNuxtModule({
  meta: {
    name: '@kehwar/trpc-nuxt-auto',
    configKey: 'trpcAuto',
  },

  defaults: defaultModuleOptions,

  // The function holding your module logic, it can be asynchronous
  async setup(moduleOptions, nuxt) {
    const options: Options = { ...moduleOptions, cwd: nuxt.options.srcDir }

    // Scan TRPC files
    const files: string[] = []
    async function scanTRPCFiles() {
      files.length = 0
      const updatedFiles = await fg(options.pattern, {
        cwd: options.cwd,
        absolute: true,
        onlyFiles: true,
        ignore: ['!**/node_modules', '!**/dist'],
      })
      files.push(...new Set(updatedFiles))
      return files
    }
    await scanTRPCFiles()

    // Rebuild the app on changes to the files
    const filter = createFilter(options.pattern)
    nuxt.hook('builder:watch', async (e, path) => {
      if (e === 'change')
        return
      if (filter(path)) {
        await scanTRPCFiles()
        await nuxt.callHook('builder:generateApp')
      }
    })

    // Generate template content
    const content = generateTemplateString(files, options)

    // Write template files
    addTemplate({
      filename: 'trpc-auto-router.ts',
      write: true,
      getContents() {
        return content
      },
    })
    addTypeTemplate({
      filename: 'types/trpc-auto.d.ts',
      getContents: () =>
        [
          'declare module \'#trpcAuto\' {',
                    `const TRPCAutoRouter: typeof import('../trpc-auto-router').TRPCAutoRouter`,
                    '}',
        ].join('\n'),
    })
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#trpcAuto'] = content
    })

    // Add vite plugin
    addVitePlugin(transformServerFiles(options))
  },
})

function generateTemplateString(files: string[], options: Options) {
  // Parse files
  const procedures = files.map(file => parseProcedurePath(file, options))

  // Create composable
  const resolver = createResolver(options.cwd)
  const appImport = `import router from '${resolver.resolve(options.inject.router)}'`

  // Generate imports
  const importsString = procedures
    .map(({ importPath, importName }) => {
      return `import * as ${importName} from '${importPath}'`
    })
    .join('\n')

  // Create router string
  const routerString = (() => {
    const routeMap: Record<string, any> = {}
    for (const obj of procedures)
      _.set(routeMap, `${obj.routerPathName}.${obj.procedureName}`, `${obj.importName}.default`)
    function stringify(obj: Record<string, any>, depth: number) {
      let str = ''
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key]
          str += typeof value === 'object' ? `${key}: router({\n${stringify(value, depth + 1)}}),\n` : `${key}: ${value},\n`
        }
      }
      return str
    }
    return `export const TRPCAutoRouter = router({\n${stringify(routeMap, 1)}});`
  })()

  // Return
  return [
    appImport,
    importsString,
    routerString,
  ].join('\n')
}

function parseProcedurePath(file: string, { cwd, queryPrefixes, mutationPrefixes, subscriptionPrefixes, defaultAction }: Options) {
  const relativePath = path.relative(cwd, file)
  const routerPathName = path.dirname(relativePath).split(path.sep).map(dir => _.camelCase(dir)).join('.')
  const procedureName = _.camelCase(path.basename(relativePath, path.extname(relativePath)).split('.').slice(0, -1).join('_'))
  const importPath = path.join(cwd, path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)))
  const importName = [_.camelCase(routerPathName), procedureName].join('_')
  const procedurePrefix = _.kebabCase(procedureName).split('-')[0]
  const action = queryPrefixes.includes(procedurePrefix)
    ? 'query'
    : mutationPrefixes.includes(procedurePrefix)
      ? 'mutation'
      : subscriptionPrefixes.includes(procedurePrefix)
        ? 'subscription'
        : defaultAction
  if (action === 'error')
    throw createError(`Could not guess action for ${file}`)
  return {
    routerPathName,
    procedureName,
    importPath,
    importName,
    action,
  }
}
type TRPCProcedure = ReturnType<typeof parseProcedurePath>

export function transformServerFiles(options: Options): Plugin {
  const filter = createFilter(options.pattern)
  return {
    name: 'vite-plugin-trpc-auto',
    enforce: 'post',
    async transform(code, id, opts) {
      if (opts?.ssr)
        return
      if (!filter(id))
        return
      const procedure = parseProcedurePath(id, options)
      const result = await transformExportsToTRPCCalls(procedure, code)
      return {
        code: result,
      }
    },
  }
}
async function transformExportsToTRPCCalls({ procedureName, routerPathName, action }: TRPCProcedure, code: string) {
  await init
  const [, exports] = parse(code)
  return exports.map((e) => {
    if (e.n === 'default')
      return ''
    return `export const ${e.n} = (...args) => useNuxtApp().$trpc.${routerPathName}.${procedureName}.${action}(...args)`
  }).join('\n')
}
