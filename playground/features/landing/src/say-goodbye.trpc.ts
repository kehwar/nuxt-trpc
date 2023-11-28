import { defineTRPCProcedure } from '~/fixtures/trpc/src/define-trpc-procedure'

export async function sayGoodbye() {
    return 'goodbye'
}

// @TRPCQuery
export default defineTRPCProcedure().input(v => v as Parameters<typeof sayGoodbye>).query(() => sayGoodbye())
