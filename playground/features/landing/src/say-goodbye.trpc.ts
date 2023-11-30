import { defineTRPCProcedure } from '~/fixtures/trpc/src/app'

export async function sayGoodbye() {
    return 'goodbye'
}

export default sayGoodbye

export const TRPCProcedure = defineTRPCProcedure(b => b.query(async () => await sayGoodbye()))
