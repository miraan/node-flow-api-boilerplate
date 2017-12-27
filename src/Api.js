// @flow

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'

export default class Api {
  express: express$Application

  constructor() {
    this.express = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  setupMiddleware(): void {
    this.express.use(morgan('dev'))
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
  }

  setupRoutes(): void {
    this.express.use((req: $Request, res: $Response) => {
      res.json({ message: 'hello world' })
    })
  }
}
