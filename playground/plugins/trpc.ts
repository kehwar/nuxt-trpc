import { createTRPCClient } from '~/fixtures/trpc/src/create-trpc-client'

export default defineNuxtPlugin(() => {
    const trpc = createTRPCClient()
    return {
        provide: {
            trpc,
        },
    }
})
