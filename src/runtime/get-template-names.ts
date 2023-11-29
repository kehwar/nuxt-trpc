import _ from 'lodash'

export function getTemplateNames(name: 'server-handler' | 'procedure' | 'routes') {
    const asPath = `trpc-auto/${name}`
    const asKebab = `trpc-auto-${name}`
    const asVar = _.camelCase(name)
    const asVirtual = `#trpc-auto/${asVar}`
    return {
        asPath,
        asKebab,
        asVar,
        asVirtual,
    }
}
