import dedent from 'dedent'

export function getApiTemplate() {
    return dedent`
        import { initTRPC, TRPCError } from '@trpc/server'
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

        export function defineTRPCQuery<TFunc extends ServerFunction>(func: TFunc, options?: TRPCProcedureOptions<TFunc>) {
            return defineTRPCProcedure(p => p
                .input(options?.validateInput ?? skipValidateInput<TFunc>)
                .query(async ({ input }) => executeTRPCCall(func, { input: input as any }, options)),
            )
        }

        export function defineTRPCMutation<TFunc extends ServerFunction>(func: TFunc, options?: TRPCProcedureOptions<TFunc>) {
            return defineTRPCProcedure(p => p
                .input(options?.validateInput ?? skipValidateInput<TFunc>)
                .mutation(async ({ input }) => executeTRPCCall(func, { input: input as any }, options)),
            )
        }

        async function executeTRPCCall<TFunc extends ServerFunction>(func: TFunc, state: TRPCCallState<TFunc>, options?: TRPCProcedureOptions<TFunc>) {
            // Authorization guard
            try {
                if (options?.allowIf != null) {
                    const guardResult = await options.allowIf(state)
                    if (guardResult !== true)
                        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sin autorización' })
                }
            }
            catch (error: any) {
                if (error instanceof TRPCError)
                    throw error
                throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message })
            }

            // Transform Input
            if (options?.transformInput != null)
                state.input = await options.transformInput(state)

            // Call server function
            state.output = await func(...(state.input != null ? state.input : []))

            // Transform Output
            if (options?.transformOutput != null)
                state.output = await options.transformOutput(state)

            // On Complete
            if (options?.onCompleted != null)
                await options.onCompleted(state)

            // Return
            return state.output as Output<TFunc>
        }

        function skipValidateInput<TFunc extends ServerFunction>(v: unknown) {
            return v as Parameters<TFunc>
        }

        type ServerFunction = (...args: any[]) => Promise<any>
        type Output<TFunc extends ServerFunction> = Awaited<ReturnType<TFunc>>
        type Maybe<T> = T | null | undefined
        type MaybePromise<T> = T | Promise<T>

        interface TRPCCallState<TFunc extends ServerFunction> {
            input: Parameters<TFunc>
            output?: Output<TFunc>
        }

        interface TRPCProcedureOptions<TFunc extends ServerFunction> {
            validateInput?: (v: unknown) => MaybePromise<Parameters<TFunc>>
            allowIf?: (state: TRPCCallState<TFunc>) => MaybePromise<Maybe<boolean>>
            transformInput?: (state: TRPCCallState<TFunc>) => MaybePromise<Parameters<TFunc>>
            transformOutput?: (state: TRPCCallState<TFunc>) => MaybePromise<Output<TFunc>>
            onCompleted?: (state: TRPCCallState<TFunc>) => MaybePromise<void>
        }

        export { TRPCApp }
    `
}
