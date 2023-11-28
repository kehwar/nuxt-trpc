import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import { getDataTransformer } from './get-data-transformer'
import type { TRPCAutoRouter } from '#trpcAuto'

/**
 * Create the TRPC client instance
 */
export function createTRPCClient() {
    return createTRPCNuxtClient<typeof TRPCAutoRouter>({
    /**
     * Use data transformer
     *
     * @see https://trpc.io/docs/server/data-transformers#using-superjson
     */
        transformer: getDataTransformer(),
        links: [
            httpBatchLink({
                url: '/api/trpc',
                async headers() {
                    return {
                        ...useRequestHeaders(),
                    }
                },
            }),
        ],
    })
}
