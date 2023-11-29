import { addImports, addServerImports, addTemplate, addTypeTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import dedent from 'dedent'
import type { Options } from './options'

const safefilename = 'trpc-auto-procedure'
const varName = 'defineTRPCProcedure'
const virtualFilename = `#trpcAutoProcedure`

export function writeProcedureTemplateFiles(options: Options) {
    const resolver = createResolver(options.cwd)
    const content = dedent`
        import createTRPCApp from '${resolver.resolve(options.inject.app)}'
        export function ${varName}(){ return createTRPCApp().procedure }
        export default ${varName}
    `
    addTemplate({
        filename: `${safefilename}.ts`,
        write: true,
        getContents() {
            return content
        },
    })
    addTypeTemplate({
        filename: `types/${safefilename}.d.ts`,
        getContents: () => dedent`
            declare module '${virtualFilename}' {
                const ${varName}: typeof import('../${safefilename}').${varName}
            }
        `,
    })
    options.nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {}
        nitroConfig.virtual[virtualFilename] = content
    })
    addImports({
        from: `#build/${safefilename}`,
        name: varName,
    })
    addServerImports([{
        from: virtualFilename,
        name: varName,
    }])
}
