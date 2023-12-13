import { addImports, addPluginTemplate, addServerHandler, addServerImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import _ from 'lodash'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { parseProcedurePath } from './runtime/parse-procedure-path'
import { addTransformerPlugin } from './runtime/add-transformer-plugin'
import { getApiTemplate } from './templates/get-api-template'
import { getClientPluginTemplate } from './templates/get-client-plugin-template'
import { getServerHandlerTemplate } from './templates/get-server-handler-template'
import { getContextTemplate } from './templates/get-context-template'

export default defineNuxtModule({
    meta: {
        name: '@kehwar/nuxt-trpc',
        configKey: 'trpc',
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
            filename: 'trpc/api.ts',
            write: true,
            getContents() {
                return getApiTemplate(options)
            },
        })
        addPluginTemplate({
            filename: 'trpc/client-plugin.ts',
            write: true,
            getContents() {
                return getClientPluginTemplate(options)
            },
        })
        addTemplate({
            filename: 'trpc/server-handler.ts',
            write: true,
            getContents() {
                return getServerHandlerTemplate(procedures, options)
            },
        })
        addTemplate({
            filename: 'trpc/context.ts',
            write: true,
            getContents() {
                return getContextTemplate()
            },
        })

        // Add to types
        nuxt.hook('prepare:types', (options) => {
            options.tsConfig.include?.unshift('./trpc')
        })

        const resolver = createResolver(nuxt.options.buildDir)

        // Write autoimports
        addImports(
            [{
                name: 'useTRPCRequestHeaders',
                from: resolver.resolve('trpc/client-plugin'),
            }, {
                name: 'defineTRPCContext',
                from: resolver.resolve('trpc/context'),
            }, {
                name: 'defineTRPCProcedure',
                from: resolver.resolve('trpc/api'),
            }, {
                name: 'defineTRPCQuery',
                from: resolver.resolve('trpc/api'),
            }, {
                name: 'defineTRPCMutation',
                from: resolver.resolve('trpc/api'),
            }],
        )
        addServerImports(
            [{
                name: 'defineTRPCContext',
                from: resolver.resolve('trpc/context'),
            }, {
                name: 'defineTRPCProcedure',
                from: resolver.resolve('trpc/api'),
            }, {
                name: 'defineTRPCQuery',
                from: resolver.resolve('trpc/api'),
            }, {
                name: 'defineTRPCMutation',
                from: resolver.resolve('trpc/api'),
            }],
        )

        // Add server handler
        addServerHandler({
            route: `${options.server.baseUrl}/:trpc`,
            handler: resolver.resolve('trpc/server-handler'),
        })

        // Add vite plugin
        addTransformerPlugin(options)
    },
})
