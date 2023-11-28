import { addTemplate, addTypeTemplate, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import fg from 'fast-glob'
import _ from 'lodash'
import { parseProcedurePath } from './runtime/parse-procedure-path'
import { transformServerFiles } from './runtime/transform-server-files'
import { DefaultModuleOptions, type Options } from './runtime/options'

export default defineNuxtModule({
    meta: {
        name: '@kehwar/trpc-nuxt-auto',
        configKey: 'trpcAuto',
    },

    defaults: DefaultModuleOptions,

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
