import type { Nuxt } from '@nuxt/schema'

export const DefaultModuleOptions = {
    pattern: '**/*.trpc.{ts,js,mjs}',
    remoteFunctions: {
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
