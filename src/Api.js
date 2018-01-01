// @flow

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import passport from 'passport'
import { Strategy } from 'passport-http-bearer'
import TokenStore from './stores/TokenStore'
import DataStore from './stores/DataStore'
import FacebookClient from './FacebookClient'

import LoginRouter from './routers/LoginRouter'
import UserRouter from './routers/UserRouter'
import TripRouter from './routers/TripRouter'

import type { Debugger } from 'debug'

export default class Api {
  express: express$Application
  logger: Debugger
  tokenStore: TokenStore
  dataStore: DataStore
  facebookClient: FacebookClient

  constructor(
    logger: Debugger,
    tokenStore: TokenStore,
    dataStore: DataStore,
    facebookClient: FacebookClient
  ) {
    this.express = express()
    this.logger = logger
    this.tokenStore = tokenStore
    this.dataStore = dataStore
    this.facebookClient = facebookClient
    this.initMiddleware()
    this.initPassport()
    this.initRoutes()
  }

  initMiddleware = () => {
    this.express.use(morgan('dev'))
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
  }

  initPassport = () => {
    passport.use(new Strategy((token, cb) => {
      this.tokenStore.getUserId(token).then(userId => {
        if (!userId) {
          cb(null, false)
          return Promise.reject(null)
        }
        return this.dataStore.getUserById(userId)
      })
      .then(user => {
        if (!user) {
          cb(null, false)
          return Promise.reject(null)
        }
        cb(null, user)
      })
      .catch(error => {
        if (!error) {
          return
        }
        return cb('Authentication Error: ' + error)
      })
    }))
  }

  initRoutes = () => {
    const loginRouter = new LoginRouter(
      this.logger,
      this.tokenStore,
      this.dataStore,
      this.facebookClient
    )
    this.express.use(loginRouter.path, loginRouter.router)

    const userRouter = new UserRouter(this.logger, this.dataStore)
    this.express.use(userRouter.path, userRouter.router)

    const tripRouter = new TripRouter(this.logger, this.dataStore)
    this.express.use(tripRouter.path, tripRouter.router)
  }
}
