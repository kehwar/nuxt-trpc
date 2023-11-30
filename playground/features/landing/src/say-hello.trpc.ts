export async function sayHello(message?: string) {
    return `hello ${message}`
}

export default sayHello

export const TRPCProcedure = defineTRPCProcedure(b => b.input(v => v as string | undefined).query(async ({ input }) => `${await sayHello(input)} from TRPC`))
