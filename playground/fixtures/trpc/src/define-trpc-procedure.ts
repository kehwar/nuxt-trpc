import { createTRPCApp } from './create-trpc-app'

export function defineTRPCProcedure() {
    return createTRPCApp().procedure
}
