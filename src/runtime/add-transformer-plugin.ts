import { addVitePlugin } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import _ from 'lodash'
import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'
import type { Options } from './options'
import type { TRPCProcedure } from './parse-procedure-path'
import { parseProcedurePath } from './parse-procedure-path'

export function addTransformerPlugin(options: Options) {
    const filter = createFilter(options.pattern)
    const plugin: Plugin = {
        name: 'vite-plugin-trpc',
        enforce: 'post',
        async transform(code, id, _opts) {
            if (!filter(id))
                return
            const procedure = parseProcedurePath(id, options)
            const result = await transformExportsToTRPCCalls(code, procedure, options)
            return {
                code: result,
            }
        },
    }
    addVitePlugin(plugin)
}
async function transformExportsToTRPCCalls(src: string, { procedureName, routerPathName, baseName, action }: TRPCProcedure, options: Options) {
    if (action === 'error')
        throw new Error(`Could not determine action for ${baseName}`)
    await init
    const [, exports] = parse(src)
    const exportList = exports.map(e => e.n).filter(e => e !== 'default')
    return exportList.map(e => `export const ${e} = (...args) => useNuxtApp().$${options.client.alias}.${routerPathName}.${procedureName}.${action}(args)`).join('\n')
}
