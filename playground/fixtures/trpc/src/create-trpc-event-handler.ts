import { createNuxtApiHandler } from 'trpc-nuxt'
import { TRPCAutoRouter } from '#trpcAuto'
import { createTRPCEventContext } from './create-trpc-event-context'

/**
 * Create the TRPC event handler
 *
 * @see https://trpc-nuxt.vercel.app/get-started/usage/recommended#_1-create-a-trpc-router
 */
export function createTRPCEventHandler() {
    return createNuxtApiHandler({ router: TRPCAutoRouter, createContext: createTRPCEventContext })
}
