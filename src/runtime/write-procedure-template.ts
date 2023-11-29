import { addImports, addServerImports, addTemplate, addTypeTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import type { Options } from './options'

const safefilename = 'trpc-auto-procedure'
const varName = 'defineTRPCProcedure'
const virtualFilename = `#trpcAutoProcedure`

export function writeProcedureTemplateFiles(options: Options) {
    const resolver = createResolver(options.cwd)
    const content = [
        `import createTRPCApp from '${resolver.resolve(options.inject.app)}'`,
        `export function ${varName}(){ return createTRPCApp().procedure }`,
        `export default ${varName}`,
    ].join('\n')
    addTemplate({
        filename: `${safefilename}.ts`,
        write: true,
        getContents() {
            return content
        },
    })
    addTypeTemplate({
        filename: `types/${safefilename}.d.ts`,
        getContents: () =>
            [
                `declare module '${virtualFilename}' {`,
                `const ${varName}: typeof import('../${safefilename}').${varName}`,
                '}',
            ].join('\n'),
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
