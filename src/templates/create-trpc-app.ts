import { initTRPC } from '@trpc/server'
import _ from 'lodash'
import { getDataTransformer } from './get-data-transformer'
import type { createTRPCEventContext } from './create-trpc-event-context'

/**
 * Initialize TRPC App
 *
 * @see https://trpc-nuxt.vercel.app/get-started/usage/recommended#_1-create-a-trpc-router
 */
export const createTRPCApp = _.once(() =>
    initTRPC
        .context<typeof createTRPCEventContext>()
        .create({
            transformer: getDataTransformer(),
        }),
)
