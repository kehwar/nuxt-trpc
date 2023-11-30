import fs from 'node:fs'
import { addTemplate, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import fg from 'fast-glob'
import _ from 'lodash'
import { addTransformerPlugin } from './runtime/add-transformer-plugin'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { writeRouterTemplateFiles } from './runtime/write-router-template'
import { writeProcedureTemplateFiles } from './runtime/write-procedure-template'
import { writeServerHandlerTemplateFiles } from './runtime/write-server-handler-template'

export default defineNuxtModule({
    meta: {
        name: '@kehwar/trpc-nuxt-auto',
        configKey: 'trpcAuto',
    },

    defaults: DefaultModuleOptions,

    // The function holding your module logic, it can be asynchronous
    async setup(moduleOptions, nuxt) {
        const resolver = createResolver(nuxt.options.srcDir)
        const clientPluginPath = resolver.resolve('fixtures/trpc/src/client-plugin.ts')
        if (fs.existsSync(clientPluginPath)) {
            addTemplate({
                filename: 'trpc-auto/client-plugin.ts',
                write: true,
                getContents() {
                    return fs.readFileSync(clientPluginPath, 'utf-8')
                },
            })
        }
        const serverHandlerPath = resolver.resolve('fixtures/trpc/src/server-handler.ts')
        if (fs.existsSync(serverHandlerPath)) {
            addTemplate({
                filename: 'trpc-auto/server-handler.ts',
                write: true,
                getContents() {
                    return fs.readFileSync(serverHandlerPath, 'utf-8')
                },
            })
        }
    },
})
