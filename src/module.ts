import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import fg from 'fast-glob'
import _ from 'lodash'
import { addTransformerPlugin } from './runtime/add-transformer-plugin'
import { DefaultModuleOptions, type Options } from './runtime/options'
import { writeRouterTemplateFiles } from './runtime/write-router-template'
import { writeProcedureTemplateFiles } from './runtime/write-procedure-template'

export default defineNuxtModule({
    meta: {
        name: '@kehwar/trpc-nuxt-auto',
        configKey: 'trpcAuto',
    },

    defaults: DefaultModuleOptions,

    // The function holding your module logic, it can be asynchronous
    async setup(moduleOptions, nuxt) {
        const options: Options = { ...moduleOptions, nuxt, cwd: nuxt.options.srcDir }

        // Scan TRPC files
        const files: string[] = []
        async function scanTRPCFiles() {
            files.length = 0
            const updatedFiles = await fg(options.pattern, {
                cwd: options.nuxt.options.srcDir,
                absolute: true,
                onlyFiles: true,
                ignore: ['!**/node_modules', '!**/dist'],
            })
            files.push(...new Set(updatedFiles))
            return files
        }
        await scanTRPCFiles()

        // Rebuild the app on changes to the files
        const filter = createFilter(options.pattern)
        nuxt.hook('builder:watch', async (e, path) => {
            if (e === 'change')
                return
            if (filter(path)) {
                await scanTRPCFiles()
                await nuxt.callHook('builder:generateApp')
            }
        })

        // Write template files
        writeRouterTemplateFiles(files, options)
        writeProcedureTemplateFiles(options)

        // Add vite plugin
        addTransformerPlugin(options)
    },
})
