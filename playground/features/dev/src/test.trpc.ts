import { defineTRPCProcedure } from '~/fixtures/trpc/src/app'

export async function sayTest() {
    const meta = {
        client: import.meta.client,
    }
    const result = JSON.stringify(meta)
    return result
}

export default sayTest

export const TRPCProcedure = defineTRPCProcedure(b => b.query(async () => await sayTest()))
