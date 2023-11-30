export default defineNuxtConfig({
    // modules: ['../src/module'],
    build: {
        transpile: ['trpc-nuxt'],
    },
    devtools: { enabled: true },
    ssr: false,
})
