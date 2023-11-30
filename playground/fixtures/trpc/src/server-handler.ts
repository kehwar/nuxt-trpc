import _ from 'lodash'
import { createNuxtApiHandler } from 'trpc-nuxt'
import TRPCApp from './app'

/* @TRPCProcedureImports */

import * as featuresLandingSrc_sayGoodbye from 'C:/Workspace/kehwar/trpc-nuxt-auto/playground/features/landing/src/say-goodbye.trpc'
import * as featuresLandingSrc_sayHello from 'C:/Workspace/kehwar/trpc-nuxt-auto/playground/features/landing/src/say-hello.trpc'
import * as featuresDevSrc_test from 'C:/Workspace/kehwar/trpc-nuxt-auto/playground/features/dev/src/test.trpc'

/* @TRPCProcedureImports */

const router = TRPCApp.router

/* @TRPCRoutes */

const routes = router({
    features: router({
        dev: router({
            src: router({
                test: featuresDevSrc_test.TRPCProcedure,
            }),
        }),
        landing: router({
            src: router({
                sayGoodbye: featuresLandingSrc_sayGoodbye.TRPCProcedure,
                sayHello: featuresLandingSrc_sayHello.TRPCProcedure,
            }),
        }),
    }),
})

/* @TRPCRoutes */

export type TRPCRoutes = typeof routes

export const TRPCServerHandler = createNuxtApiHandler({
    router: routes,
})

export default TRPCServerHandler
