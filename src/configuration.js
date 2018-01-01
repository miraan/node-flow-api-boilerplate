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
  testUserFacebookAccessToken: 'EAAF9bKAZCMAoBANIloxQ4Jy2JzjtISohWrTJLyvcZBTgZCtKHKZCVlZCEG7xcltoSEec73kvDBf48c06Mi3nYpXcQbwx5LRA3r9c5QX9qzERPaVuBCI9xLPEoOKkZAhPKXzw2GAbQj9gQZBMAiQsNXDw6eJD5D0out6UQLPzsyl8l0cYWis2akd',
  mongoDbHost: '127.0.0.1',
  mongoDbPort: 27017,
  mongoDbDatabaseName: 'test',
  mongoDbAuthenticationDatabase: 'admin',
  mongoDbUserName: 'admin',
  mongoDbPassword: 'password',
}

export default ServerConfigurationObject
