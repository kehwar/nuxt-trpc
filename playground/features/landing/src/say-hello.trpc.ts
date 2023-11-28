export async function sayHello() {
    return 'hello'
}

export default defineTRPCProcedure().input(v => v as Parameters<typeof sayHello>).query(() => sayHello())
