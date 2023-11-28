import { defineTRPCProcedure } from '~/fixtures/trpc/src/define-trpc-procedure'

export async function sayHello() {
    return 'hello'
}

export default defineTRPCProcedure().input(v => v as Parameters<typeof sayHello>).query(() => sayHello())
