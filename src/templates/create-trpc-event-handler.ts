import { createNuxtApiHandler } from 'trpc-nuxt'
import { createTRPCEventContext } from './create-trpc-event-context'
import { TRPCAutoRouter } from '#trpcAuto'

/**
 * Create the TRPC event handler
 *
 * @see https://trpc-nuxt.vercel.app/get-started/usage/recommended#_1-create-a-trpc-router
 */
export function createTRPCEventHandler() {
    return createNuxtApiHandler({ router: TRPCAutoRouter, createContext: createTRPCEventContext })
}
