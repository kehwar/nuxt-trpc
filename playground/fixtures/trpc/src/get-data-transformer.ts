/* eslint-disable no-eval */

import { uneval } from 'devalue'
import _ from 'lodash'
import superjson from 'superjson'

export const getDataTransformer = _.once(() => ({

    // Serialize input with superjson, this allows us to use `Date`s in our API
    input: superjson,

    // Serialize output with `devalue` for better performance
    output: {
        serialize: (object: unknown) => uneval(object),
        deserialize: (object: unknown) => eval(`(${object})`),
    },
}))
