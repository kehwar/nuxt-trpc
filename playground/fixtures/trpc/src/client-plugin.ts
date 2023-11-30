import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import { TRPCDataTransformer } from './data-transformer'
import type { TRPCRoutes } from './server-handler'

export const TRPCClientPlugin = defineNuxtPlugin(() => {
    const headers = useRequestHeaders()
    const client = createTRPCNuxtClient<TRPCRoutes>({
        transformer: TRPCDataTransformer,
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
