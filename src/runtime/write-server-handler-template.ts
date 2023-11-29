import { addImports, addServerHandler, addServerImports, addTemplate, addTypeTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import dedent from 'dedent'
import type { Options } from './options'

const safefilename = 'trpc-auto-server-handler'
const virtualFilename = `#trpcAutoServerHandler`

export function writeServerHandlerTemplateFiles(options: Options) {
    const resolver = createResolver(options.cwd)
    const content = dedent`
        import { createNuxtApiHandler } from 'trpc-nuxt'
        import createContext from '${resolver.resolve(options.inject.context)}'
        import { TRPCAutoRouter } from '#trpcAuto'
        export default createNuxtApiHandler({ router: TRPCAutoRouter, createContext })
    `
    addTemplate({
        filename: `${safefilename}.ts`,
        write: true,
        getContents() {
            return content
        },
    })
    options.nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {}
        nitroConfig.virtual[virtualFilename] = content
    })
    addServerHandler({
        route: 'api/trpc/[trpc].ts',
        handler: virtualFilename,
    })
}
