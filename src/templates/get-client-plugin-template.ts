import dedent from 'dedent'

export function getClientPluginTemplate() {
    return dedent`
        import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
        import superjson from 'superjson'
        import type { TRPCRoutes } from './server-handler'
        import { defineNuxtPlugin, useRequestHeaders } from '#imports'

        // Data Transformer
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
