import _ from 'lodash'
import dedent from 'dedent'
import type { TRPCProcedure } from '../runtime/parse-procedure-path'

export function getServerHandlerTemplate(procedures: TRPCProcedure[]) {
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
            _.set(routeMap, `${obj.routerPathName}.${obj.procedureName}`, `${obj.importName}.TRPCProcedure`)
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

    // Template
    return dedent`
        import { createNuxtApiHandler } from 'trpc-nuxt'
        import { TRPCApp } from './api'

        ${imports}

        const router = TRPCApp.router

        ${routes}

        export type TRPCRoutes = typeof routes

        export const TRPCServerHandler = createNuxtApiHandler({
            router: routes,
        })

        export default TRPCServerHandler
    `
}
