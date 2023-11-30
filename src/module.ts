import fs from 'node:fs'
import { addImports, addPlugin, addServerHandler, addServerImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import fg from 'fast-glob'
import _ from 'lodash'
import dedent from 'dedent'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { type TRPCProcedure, parseProcedurePath } from './runtime/parse-procedure-path'

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
        addImports([{
            name: 'defineTRPCProcedure',
            from: resolver.resolve('trpc-auto/api'),
        }])
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
    },
})

function getApiTemplate() {
    return dedent`
        import { initTRPC } from '@trpc/server'
        import { uneval } from 'devalue'
        import superjson from 'superjson'

        // Data Transformer
        const dataTransformer = {
            input: superjson,
            output: {
                serialize: (object: unknown) => uneval(object),
                deserialize: () => null,
            },
        }

        const TRPCApp = initTRPC.create({ transformer: dataTransformer })
        const procedure = TRPCApp.procedure

        export function defineTRPCProcedure<T>(callback: (builder: typeof procedure) => T) {
            return callback(procedure)
        }

        export { TRPCApp }
    `
}

function getClientPluginTemplate() {
    return dedent`
        import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
        import superjson from 'superjson'
        import type { TRPCRoutes } from './server-handler'
        import { defineNuxtPlugin, useRequestHeaders } from '#imports'

        const dataTransformer = {
            input: superjson,
            output: {
                serialize: () => null,
                deserialize: (object: unknown) => eval(\`(\${object})\`),
            },
        }

        const TRPCClientPlugin = defineNuxtPlugin(() => {
            const headers = useRequestHeaders()
            const client = createTRPCNuxtClient<TRPCRoutes>({
                transformer: dataTransformer,
                links: [
                    httpBatchLink({
                        url: '/api/trpc',
                        async headers() {
                            return {
                                ...headers,
                            }
                        },
                    }),
                ],
            })
            return {
                provide: {
                    trpc: client,
                },
            }
        })

        export default TRPCClientPlugin
    `
}

function getServerHandlerTemplate(procedures: TRPCProcedure[]) {
    const imports = procedures
        .map(({ importPath, importName }) => {
            return `import * as ${importName} from '${importPath}'`
        })
        .join('\n')
    const routes = (() => {
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
    })()
    return dedent`
        import { createNuxtApiHandler } from 'trpc-nuxt'
        import { TRPCApp } from './api'

        ${imports}

        const router = TRPCApp.router

        ${routes}

        export type TRPCRoutes = typeof routes

        export const TRPCServerHandler = createNuxtApiHandler({
            router: routes,
        })

        export default TRPCServerHandler
    `
}
