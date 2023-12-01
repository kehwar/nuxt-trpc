import { addVitePlugin } from '@nuxt/kit'
import { createFilter } from '@rollup/pluginutils'
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
        transform(_code, id, _opts) {
            if (!filter(id))
                return
            const procedure = parseProcedurePath(id, options)
            const result = transformExportsToTRPCCalls(procedure)
            return {
                code: result,
            }
        },
    }
    addVitePlugin(plugin)
}
function transformExportsToTRPCCalls({ procedureName, routerPathName, action }: TRPCProcedure) {
    return `export const ${procedureName} = (...args) => useNuxtApp().$trpc.${routerPathName}.${procedureName}.${action}(args)`
}
