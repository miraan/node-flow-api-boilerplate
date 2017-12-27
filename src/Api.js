// @flow

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import ProduceRouter from './routers/ProduceRouter'

import type { Debugger } from 'debug'

export default class Api {
  express: express$Application
  logger: Debugger

  constructor(logger: Debugger) {
    this.express = express()
    this.logger = logger
    this.initMiddleware()
    this.initRoutes()
  }

  initMiddleware(): void {
    this.express.use(morgan('dev'))
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
  }

  initRoutes(): void {
    const produceRouter = new ProduceRouter(this.logger)
    this.express.use(produceRouter.path, produceRouter.router)
  }
}
