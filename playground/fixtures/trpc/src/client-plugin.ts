import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import _ from 'lodash'
import superjson from 'superjson'
import type { TRPCRoutes } from './server-handler'

const dataTransformer = {
    input: superjson,
    output: {
        serialize: _.noop,
        // eslint-disable-next-line no-eval
        deserialize: (object: unknown) => eval(`(${object})`),
    },
}

export const TRPCClientPlugin = defineNuxtPlugin(() => {
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
