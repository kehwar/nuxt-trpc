import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import { getDataTransformer } from './get-data-transformer'
import type routes from '#trpc-auto/routes'

/**
 * Create the TRPC client instance
 */
export function createTRPCClient() {
    return createTRPCNuxtClient<typeof routes>({
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
