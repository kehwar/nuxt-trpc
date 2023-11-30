import fs from 'node:fs'
import { addImports, addPlugin, addServerHandler, addServerImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import _ from 'lodash'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { parseProcedurePath } from './runtime/parse-procedure-path'

export default defineNuxtModule({
    meta: {
        name: '@kehwar/trpc-nuxt-auto',
        configKey: 'trpcAuto',
    },

    defaults: DefaultModuleOptions,

    // The function holding your module logic, it can be asynchronous
    async setup(moduleOptions, nuxt) {
        // Options
        const options: Options = { ...moduleOptions, nuxt, cwd: nuxt.options.srcDir }
        const resolver = createResolver(nuxt.options.srcDir)
        const buildResolver = createResolver(nuxt.options.buildDir)

        // Scan TRPC files
        const files: string[] = []
        async function scanTRPCFiles() {
            files.length = 0
            const updatedFiles = await fg(options.pattern, {
                cwd: options.nuxt.options.srcDir,
                absolute: true,
                onlyFiles: true,
                ignore: ['!**/node_modules', '!**/dist'],
            })
            files.push(...new Set(updatedFiles))
            return files
        }
        await scanTRPCFiles()

        // Get Procedures
        const procedures = files.map(file => parseProcedurePath(file, options))

        // Get template files
        const appPath = resolver.resolve('fixtures/trpc/src/app.ts')
        const pluginPath = resolver.resolve('fixtures/trpc/src/client-plugin.ts')
        const handlerPath = resolver.resolve('fixtures/trpc/src/server-handler.ts')
        if (!fs.existsSync(appPath))
            return
        if (!fs.existsSync(pluginPath))
            return
        if (!fs.existsSync(handlerPath))
            return
        const appContent = fs.readFileSync(appPath, 'utf-8')
        const pluginContent = fs.readFileSync(pluginPath, 'utf-8')
        let handlerContent = fs.readFileSync(handlerPath, 'utf-8')

        // Inject imports
        handlerContent = injectString(
            handlerContent,
            '/* @TRPCProcedureImports */',
            procedures
                .map(({ importPath, importName }) => {
                    return `import * as ${importName} from '${importPath}'`
                })
                .join('\n'),
        )
        handlerContent = injectString(
            handlerContent,
            '/* @TRPCRoutes */',
            (() => {
                const routeMap: Record<string, any> = {}
                for (const obj of procedures)
                    _.set(routeMap, `${obj.routerPathName}.${obj.procedureName}`, `${obj.importName}.TRPCProcedure`)
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
                return [
                    `export const routes = router({\n${stringify(routeMap, 1)}})`,
                ].join('\n')
            })(),
        )

        // Write template files
        addTemplate({
            filename: 'trpc-auto/app.ts',
            write: true,
            getContents() {
                return appContent
            },
        })
        addTemplate({
            filename: 'trpc-auto/client-plugin.ts',
            write: true,
            getContents() {
                return pluginContent
            },
        })
        addTemplate({
            filename: 'trpc-auto/server-handler.ts',
            write: true,
            getContents() {
                return handlerContent
            },
        })
        nuxt.hook('prepare:types', (options) => {
            options.tsConfig.include?.unshift('./trpc-auto')
        })

        // Write autoimports
        addImports([{
            name: 'defineTRPCProcedure',
            from: buildResolver.resolve('trpc-auto/app'),
        }])
        addServerImports([{
            name: 'defineTRPCProcedure',
            from: buildResolver.resolve('trpc-auto/app'),
        }])

        // Add server handler
        addServerHandler({
            route: '/api/trpc/:trpc',
            handler: buildResolver.resolve('trpc-auto/server-handler'),
        })

        // Add plugin
        addPlugin(buildResolver.resolve('trpc-auto/client-plugin'))
    },
})

function injectString(content: string, indicator: string, value: string) {
    const blockStart = content.indexOf(indicator)
    const blockEnd = content.lastIndexOf(indicator)
    return content.slice(0, blockStart) + value + content.slice(blockEnd + indicator.length)
}
