import { addServerHandler, addTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import dedent from 'dedent'
import type { Options } from './options'
import { getTemplateNames } from './get-template-names'

const name = getTemplateNames('server-handler')
const routes = getTemplateNames('routes')

export function writeServerHandlerTemplateFiles(options: Options) {
    const resolver = createResolver(options.cwd)
    const content = dedent`
        import { createNuxtApiHandler } from 'trpc-nuxt'
        import createContext from '${resolver.resolve(options.inject.context)}'
        import {${routes.asVar}} from '${routes.asVirtual}'
        export default createNuxtApiHandler({ router: ${routes.asVar}, createContext })
    `
    options.nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {}
        nitroConfig.virtual[name.asVirtual] = content
    })
    addServerHandler({
        route: 'api/trpc/[trpc].ts',
        handler: name.asVirtual,
    })
}
