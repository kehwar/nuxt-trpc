import _ from 'lodash'
import * as path from 'pathe'
import { minimatch } from 'minimatch'
import type { Options } from './options'
import { RemoteFunctionPatterns } from './options'

export function parseProcedurePath(file: string, options: Options) {
    const { cwd } = options
    const relativePath = path.relative(cwd, file)
    const routerPathName = path.dirname(relativePath).split(path.sep).map(dir => _.camelCase(dir)).join('.')
    const procedureName = _.camelCase(path.basename(relativePath, path.extname(relativePath)).split('.').slice(0, -1).join('_'))
    const importPath = path.join(cwd, path.dirname(relativePath), path.basename(relativePath, path.extname(relativePath)))
    const importName = [_.camelCase(routerPathName), procedureName].join('_')
    const baseName = path.basename(relativePath)
    const action = getAction(baseName, options)
    return {
        routerPathName,
        procedureName,
        importPath,
        importName,
        action,
        baseName,
    }
}
export type TRPCProcedure = ReturnType<typeof parseProcedurePath>

export function getAction(baseName: string, { remoteFunctions }: Options) {
    const { patterns, default: defaultType } = remoteFunctions
    if (patterns.query.some(pattern => minimatch(baseName, pattern)))
        return 'query'
    if (patterns.mutation.some(pattern => minimatch(baseName, pattern)))
        return 'mutate'
    if (RemoteFunctionPatterns.query.some(pattern => minimatch(baseName, pattern)))
        return 'query'
    if (RemoteFunctionPatterns.mutation.some(pattern => minimatch(baseName, pattern)))
        return 'mutate'
    return defaultType === 'mutation' ? 'mutate' : defaultType
}
