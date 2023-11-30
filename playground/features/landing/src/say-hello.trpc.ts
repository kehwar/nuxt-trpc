import { defineTRPCProcedure } from '~/fixtures/trpc/src/app'

export async function sayHello() {
    return 'hello'
}

export default sayHello

export const TRPCProcedure = defineTRPCProcedure(b => b.query(async () => await sayHello()))
