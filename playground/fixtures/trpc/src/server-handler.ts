import { initTRPC } from '@trpc/server'
import _ from 'lodash'
import { createNuxtApiHandler } from 'trpc-nuxt'
import { uneval } from 'devalue'
import superjson from 'superjson'

import { sayGoodbye } from '~/features/landing/src/say-goodbye.trpc'
import { sayTest } from '~/features/dev/src/test.trpc'
import { sayHello } from '~/features/landing/src/say-hello.trpc'

const dataTransformer = {
    input: superjson,
    output: {
        serialize: (object: unknown) => uneval(object),
        deserialize: _.noop,
    },
}

const app = initTRPC.create({ transformer: dataTransformer })
const router = app.router
const procedure = app.procedure

const routes = router({
    features: router({
        dev: router({
            src: router({
                test: procedure.query(async () => await sayTest()),
            }),
        }),
        landing: router({
            src: router({
                sayGoodbye: procedure.query(async () => await sayGoodbye()),
                sayHello: procedure.query(async () => await sayHello()),
            }),
        }),
    }),
})
export type TRPCRoutes = typeof routes

export const TRPCServerHandler = createNuxtApiHandler({
    router: routes,
})

export default TRPCServerHandler
