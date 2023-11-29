import { addImports, addServerImports, addTemplate, addTypeTemplate, createResolver } from '@nuxt/kit'
import _ from 'lodash'
import dedent from 'dedent'
import type { Options } from './options'
import { getTemplateNames } from './get-template-names'

const name = getTemplateNames('procedure')

export function writeProcedureTemplateFiles(options: Options) {
    const resolver = createResolver(options.cwd)
    const content = dedent`
        import createTRPCApp from '${resolver.resolve(options.inject.app)}'
        export function ${name.asVar}(){ return createTRPCApp().procedure }
        export default ${name.asVar}
    `
    addTemplate({
        filename: `${name.asPath}.ts`,
        write: true,
        getContents() {
            return content
        },
    })
    addTypeTemplate({
        filename: `types/${name.asKebab})}.d.ts`,
        getContents: () => dedent`
            declare module '${name.asVirtual}' {
                const ${name.asVar}: typeof import('../${name.asPath}').${name.asVar}
                export default ${name.asVar}
            }
        `,
    })
    options.nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.virtual = nitroConfig.virtual || {}
        nitroConfig.virtual[name.asVirtual] = content
    })
    addImports({
        from: `#build/${name.asPath}`,
        name: name.asVar,
        as: 'defineTRPCProcedure',
    })
    addServerImports([{
        from: name.asVirtual,
        name: name.asVar,
        as: 'defineTRPCProcedure',
    }])
}
