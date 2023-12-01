import _ from 'lodash'
import dedent from 'dedent'
import { createResolver } from '@nuxt/kit'
import type { TRPCProcedure } from '../runtime/parse-procedure-path'
import type { Options } from '../runtime/options'

export function getServerHandlerTemplate(procedures: TRPCProcedure[], options: Options) {
    // Imports
    const imports = procedures
        .map(({ importPath, importName }) => {
            return `import * as ${importName} from '${importPath}'`
        })
        .join('\n')

    // Routes
    const routes = (() => {
        const routeMap: Record<string, any> = {}
        for (const obj of procedures)
            _.set(routeMap, `${obj.routerPathName}.${obj.procedureName}`, `${obj.importName}.default`)
        function stringify(obj: Record<string, any>, depth: number) {
            let str = ''
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key]
                    str += typeof value === 'object' ? `${key}: router({\n${stringify(value, depth + 1)}}),\n` : `${key}: ${value},\n`
                }
            }
            return str
        }
        return [
            `export const routes = router({\n${stringify(routeMap, 1)}})`,
        ].join('\n')
    })()

    // Context
    const createContextPath = options.inject.context != null ? createResolver(options.cwd).resolve(options.inject.context) : './context'

    // Template
    return dedent`
        import { createNuxtApiHandler } from 'trpc-nuxt'
        import { TRPCApp } from './api'

        import createContext from '${createContextPath}'

        ${imports}

        const router = TRPCApp.router

        ${routes}

        export type TRPCRoutes = typeof routes

        export const TRPCServerHandler = createNuxtApiHandler({
            router: routes,
            createContext
        })

        export default TRPCServerHandler
    `
}
