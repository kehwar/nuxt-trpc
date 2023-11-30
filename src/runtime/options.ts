import type { Nuxt } from '@nuxt/schema'

export const DefaultModuleOptions = {
    pattern: '**/*.trpc.{ts,js,mjs}',
    queryPrefixes: [
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
    mutationPrefixes: [
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
    subscriptionPrefixes: ['subscribe'],
    defaultAction: 'query' as 'query' | 'mutation' | 'subscription' | 'error',
}
export type ModuleOptions = typeof DefaultModuleOptions
export type Options = ModuleOptions & {
    cwd: string
    nuxt: Nuxt
}
