import { addTemplate, addTypeTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import { parseProcedurePath } from './parse-procedure-path'
import type { Options } from './options'

export function writeRouterTemplateFiles(files: string[], options: Options) {
    const content = generateRouterTemplate(files, options)
    addTemplate({
        filename: 'trpc-auto-router.ts',
        write: true,
        getContents() {
            return content
        },
    })
    addTypeTemplate({
        filename: 'types/trpc-auto-router.d.ts',
        getContents: () =>
            [
                'declare module \'#trpcAuto\' {',
                `const TRPCAutoRouter: typeof import('../trpc-auto-router').TRPCAutoRouter`,
                '}',
            ].join('\n'),
    })
    options.nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {}
        nitroConfig.virtual['#trpcAuto'] = content
    })
}

function generateRouterTemplate(files: string[], options: Options) {
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
