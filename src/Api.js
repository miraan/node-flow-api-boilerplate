// @flow

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import passport from 'passport'
import { Strategy } from 'passport-http-bearer'
import ServerConfigurationObject from './configuration'
import users from '../data/users'
import redis from 'redis'

import ProduceRouter from './routers/ProduceRouter'
import LoginRouter from './routers/LoginRouter'
import UserRouter from './routers/UserRouter'
import TripRouter from './routers/TripRouter'

import type { Debugger } from 'debug'
import type { RedisClient } from 'redis'

export default class Api {
  express: express$Application
  logger: Debugger
  redisClient: RedisClient

  constructor(logger: Debugger) {
    this.express = express()
    this.logger = logger
    this.initRedisClient()
    this.initMiddleware()
    this.initPassport()
    this.initRoutes()
  }

  initRedisClient = () => {
    this.redisClient = redis.createClient(
      ServerConfigurationObject.redisServerPort,
      ServerConfigurationObject.redisServerHost)
    this.redisClient.on('connect', () => this.logger('Redis Client Connected'))
    this.redisClient.on('error', error =>
      this.logger(`Redis Client Error Event ${error}`))
  }

  initMiddleware = () => {
    this.express.use(morgan('dev'))
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
  }

  initPassport = () => {
    passport.use(new Strategy((token, cb) => {
      // $FlowFixMe
      this.redisClient.get(token, (error, value) => {
        if (!value) {
          return cb(null, false)
        }
        const userId = parseInt(value, 10)
        const user = users.find(user => user.id === userId)
        if (!user) {
          return cb('Authentication Error: No user found for valid token.')
        }
        return cb(null, user)
      })
    }))
  }

  initRoutes = () => {
    const produceRouter = new ProduceRouter(this.logger)
    this.express.use(produceRouter.path, produceRouter.router)
    const loginRouter = new LoginRouter(this.redisClient, this.logger)
    this.express.use(loginRouter.path, loginRouter.router)
    const userRouter = new UserRouter(this.logger)
    this.express.use(userRouter.path, userRouter.router)
    const tripRouter = new TripRouter(this.logger)
    this.express.use(tripRouter.path, tripRouter.router)
  }
}
