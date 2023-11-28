export async function sayTest() {
    return 'test'
}

export default defineTRPCProcedure().input(v => v as Parameters<typeof sayTest>).query(() => sayTest())
