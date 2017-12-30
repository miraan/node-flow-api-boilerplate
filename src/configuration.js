// @flow

import type { ServerConfiguration } from './util/types'

const ServerConfigurationObject: ServerConfiguration = {
  defaultPort: 3000,
  loggerPrefix: 'node-flow-api',
  tokenExpireTimeSeconds: 60 * 60 * 24 * 7,
  redisServerHost: '127.0.0.1',
  redisServerPort: 6379,
  facebookClientAppId: '419380475146250',
  facebookClientAppSecret: '03db5ff049e55538a5b38617c25d053c',
}

export default ServerConfigurationObject