/* eslint-disable no-eval */

import { uneval } from 'devalue'
import _ from 'lodash'
import superjson from 'superjson'

/**
 * Get the data transformer
 *
 * @see https://trpc.io/docs/server/data-transformers#using-superjson
 */
export const getDataTransformer = _.once(() => ({

  // Serialize input with superjson, this allows us to use `Date`s in our API
  input: superjson,

  // Serialize output with `devalue` for better performance
  output: {
    serialize: (object: unknown) => uneval(object),
    deserialize: (object: unknown) => eval(`(${object})`),
  },
}))
