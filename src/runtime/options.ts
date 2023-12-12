import type { Nuxt } from '@nuxt/schema'

export const DefaultModuleOptions = {
    pattern: '**/*.trpc.{ts,js,mjs}',
    inject: {
        context: undefined as unknown as string | undefined,
    },
    client: {
        alias: 'trpc',
    },
    server: {
        baseUrl: '/api/trpc',
    },
    remoteFunctions: {
        enabled: true as const, // TODO: allow disabling remote functions
        matchType: 'prefix' as const, // TODO: allow regex matching
        patterns: {
            query: [
                'access',
                'acquire',
                'download',
                'fetch',
                'get',
                'list',
                'obtain',
                'pull',
                'read',
                'retrieve',
                'select',
            ],
            mutation: [
                'add',
                'append',
                'create',
                'delete',
                'modify',
                'post',
                'process',
                'push',
                'send',
                'submit',
                'update',
                'upload',
                'write',
            ],
            subscription: ['subscribe'],
        },
        default: 'query' as 'query' | 'mutation' | 'subscription' | 'error',
    },
}
export type ModuleOptions = typeof DefaultModuleOptions
export type Options = ModuleOptions & {
    cwd: string
    nuxt: Nuxt
}
