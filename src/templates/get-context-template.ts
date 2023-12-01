import dedent from 'dedent'

export function getContextTemplate() {
    return dedent`
        import { H3Event } from 'h3'

        export function defineTRPCContext<TContext>(func: (event: H3Event) => TContext){
            return func
        }

        export default () => ({})
    `
}
