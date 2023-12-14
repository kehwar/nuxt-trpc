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
                'archive',
                'ban',
                'block',
                'cancel',
                'deactivate',
                'delete',
                'disable',
                'enable',
                'expire',
                'flag',
                'hide',
                'lock',
                'mark',
                'merge',
                'modify',
                'move',
                'pin',
                'post',
                'process',
                'push',
                'reactivate',
                'reject',
                'remove',
                'rename',
                'restore',
                'send',
                'set',
                'submit',
                'update',
                'upsert',
                'upload',
                'write',
            ],
        },
        default: 'query' as 'query' | 'mutation' | 'error',
    },
}
export type ModuleOptions = typeof DefaultModuleOptions
export type Options = ModuleOptions & {
    cwd: string
    nuxt: Nuxt
}
