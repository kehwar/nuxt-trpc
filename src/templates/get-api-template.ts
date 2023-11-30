import dedent from 'dedent'

export function getApiTemplate() {
    return dedent`
        import { initTRPC } from '@trpc/server'
        import { uneval } from 'devalue'
        import superjson from 'superjson'

        // Data Transformer
        const dataTransformer = {
            input: superjson,
            output: {
                serialize: (object: unknown) => uneval(object),
                deserialize: () => null,
            },
        }

        const TRPCApp = initTRPC.create({ transformer: dataTransformer })
        const procedure = TRPCApp.procedure

        export function defineTRPCProcedure<T>(callback: (builder: typeof procedure) => T) {
            return callback(procedure)
        }

        export { TRPCApp }
    `
}
