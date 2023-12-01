import { addImports, addPlugin, addServerHandler, addServerImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import _ from 'lodash'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { parseProcedurePath } from './runtime/parse-procedure-path'
import { addTransformerPlugin } from './runtime/add-transformer-plugin'
import { getApiTemplate } from './templates/get-api-template'
import { getClientPluginTemplate } from './templates/get-client-plugin-template'
import { getServerHandlerTemplate } from './templates/get-server-handler-template'

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

        // Write template files
        addTemplate({
            filename: 'trpc-auto/api.ts',
            write: true,
            getContents() {
                return getApiTemplate()
            },
        })
        addTemplate({
            filename: 'trpc-auto/client-plugin.ts',
            write: true,
            getContents() {
                return getClientPluginTemplate()
            },
        })
        addTemplate({
            filename: 'trpc-auto/server-handler.ts',
            write: true,
            getContents() {
                return getServerHandlerTemplate(procedures)
            },
        })

        // Add to types
        nuxt.hook('prepare:types', (options) => {
            options.tsConfig.include?.unshift('./trpc-auto')
        })

        const resolver = createResolver(nuxt.options.buildDir)

        // Write autoimports
        addImports(
            [{
                name: 'defineTRPCProcedure',
                from: resolver.resolve('trpc-auto/api'),
            }, {
                name: 'useTRPCRequestHeaders',
                from: resolver.resolve('trpc-auto/client-plugin'),
            }],
        )
        addServerImports([{
            name: 'defineTRPCProcedure',
            from: resolver.resolve('trpc-auto/api'),
        }])

        // Add server handler
        addServerHandler({
            route: '/api/trpc/:trpc',
            handler: resolver.resolve('trpc-auto/server-handler'),
        })

        // Add plugin
        addPlugin(resolver.resolve('trpc-auto/client-plugin'))

        // Add vite plugin
        addTransformerPlugin(options)
    },
})
