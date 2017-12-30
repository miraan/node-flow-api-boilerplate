// @flow

import redis from 'redis'
import ServerConfigurationObject from '../configuration'

import type { Debugger } from 'debug'
import type { RedisClient } from 'redis'

export default class TokenStore {
  logger: Debugger
  redisClient: RedisClient

  constructor(logger: Debugger) {
    this.logger = logger
    this.redisClient = redis.createClient(
      ServerConfigurationObject.redisServerPort,
      ServerConfigurationObject.redisServerHost)
    this.redisClient.on('connect', () => this.logger('Redis Client Connected'))
    this.redisClient.on('error', error =>
      this.logger(`Redis Client Error Event ${error}`))
  }

  setToken = (token: string, userId: number) => {
    // $FlowFixMe
    this.redisClient.set(token, userId, 'EX', ServerConfigurationObject.tokenExpireTimeSeconds)
  }

  getUserId: (string => Promise<?number>) = (token: string) => {
    return new Promise((resolve, reject) => {
      // $FlowFixMe
      this.redisClient.get(token, (error, value) => {
        if (error) {
          reject('Token Store Get Error: Redis Get Error: ' + error)
          return
        }
        if (!value) {
          resolve(null)
          return
        }
        resolve(parseInt(value, 10))
      })
    })
  }
}
