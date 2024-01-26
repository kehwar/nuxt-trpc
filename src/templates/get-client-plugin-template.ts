import dedent from 'dedent'
import type { Options } from '../runtime/options'

export function getClientPluginTemplate(options: Options) {
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

        const TRPCClientPlugin = defineNuxtPlugin((nuxt) => {
            const headers = useRequestHeaders()
            const trpcHeaders = useTRPCRequestHeaders()
            const client = createTRPCNuxtClient<TRPCRoutes>({
                transformer: dataTransformer,
                links: [
                    httpBatchLink({
                        url: '${options.server.baseUrl}',
                        async headers() {
                            await nuxt.hooks.callHook('trpc:headers', trpcHeaders)
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
                    ${options.client.alias}: client,
                },
            }
        })

        type MaybeRef<T> = T | Ref<T>

        export function useTRPCRequestHeaders(initialValue: MaybeRef<Record<string, any>> = {}): Ref<Record<string, any>> {
            return useState('trpc-header', () => initialValue)
        }

        export default TRPCClientPlugin

        interface PluginHooks {
            'trpc:headers': (headers: ReturnType<typeof useTRPCRequestHeaders>) => void
        }

        declare module '#app' {
            interface NuxtApp {
                $${options.client.alias}: ReturnType<typeof createTRPCNuxtClient<TRPCRoutes>>
            }
            interface RuntimeNuxtHooks extends PluginHooks {}
        }
    `
}
