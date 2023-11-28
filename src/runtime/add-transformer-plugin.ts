import { addVitePlugin } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
import { init, parse } from 'es-module-lexer'
import _ from 'lodash'
import type { Plugin } from 'vite'
import type { Options } from './options'
import type { TRPCProcedure } from './parse-procedure-path'
import { parseProcedurePath } from './parse-procedure-path'

export function addTransformerPlugin(options: Options) {
    const filter = createFilter(options.pattern)
    const plugin: Plugin = {
        name: 'vite-plugin-trpc-auto',
        enforce: 'post',
        async transform(code, id, opts) {
            if (opts?.ssr)
                return
            if (!filter(id))
                return
            const procedure = parseProcedurePath(id, options)
            const result = await transformExportsToTRPCCalls(procedure, code)
            return {
                code: result,
            }
        },
    }
    addVitePlugin(plugin)
}
async function transformExportsToTRPCCalls({ procedureName, routerPathName, action }: TRPCProcedure, code: string) {
    await init
    const [, exports] = parse(code)
    return exports.map((e) => {
        if (e.n === 'default')
            return ''
        return `export const ${e.n} = (...args) => useNuxtApp().$trpc.${routerPathName}.${procedureName}.${action}(...args)`
    }).join('\n')
}
