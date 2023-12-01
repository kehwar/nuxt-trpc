export default defineNuxtConfig({
    modules: ['../src/module'],
    build: {
        transpile: ['trpc-nuxt'],
    },
    devtools: { enabled: true },
    experimental: { asyncContext: true },
    trpcAuto: {
        inject: {
            context: 'server/trpc/context',
        },
    },
})
