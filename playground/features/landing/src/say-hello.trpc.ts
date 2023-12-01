import { TRPCError } from '@trpc/server'

export async function sayHello(message?: string) {
    return `hello ${message}`
}

export default defineTRPCQuery(sayHello, {
    transformInput: () => ['Mama'] as any,
})
