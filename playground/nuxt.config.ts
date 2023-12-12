export default defineNuxtConfig({
    modules: ['../src/module'],
    build: {
        transpile: ['trpc-nuxt'],
    },
    devtools: { enabled: true },
    experimental: { asyncContext: true },
    trpc: {
        inject: {
            context: 'server/trpc/context',
        },
        url: '/api/trpc2',
        alias: 'trpc2',
    },
})
