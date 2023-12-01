import dedent from 'dedent'

export function getClientPluginTemplate() {
    return dedent`
        import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
        import { unref } from 'vue'
        import superjson from 'superjson'
        import type { TRPCRoutes } from './server-handler'
        import { defineNuxtPlugin, useRequestHeaders, useState } from '#imports'
        import type { Ref } from 'vue'

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
            const trpcHeaders = useTRPCRequestHeaders()
            const client = createTRPCNuxtClient<TRPCRoutes>({
                transformer: dataTransformer,
                links: [
                    httpBatchLink({
                        url: '/api/trpc',
                        async headers() {
                            return {
                                ...unref(trpcHeaders),
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

        type MaybeRef<T> = T | Ref<T>

        export function useTRPCRequestHeaders(initialValue: MaybeRef<Record<string, any>> = {}): Ref<Record<string, any>> {
            return useState('trpc-auto-header', () => initialValue)
        }

        export default TRPCClientPlugin
    `
}
