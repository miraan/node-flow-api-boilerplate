// @flow

import { Router } from 'express'
import passport from 'passport'

import type { Debugger } from 'debug'

export default class UserRouter {
  router: Router
  path: string
  logger: Debugger

  constructor(logger: Debugger, path: string = '/api/v1/user') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.init()
  }

  init(): void {
    this.router.get('/me', passport.authenticate('bearer', { session: false }), this.getProfile)
  }

  getProfile(req: $Request, res: $Response): void {
    res.json({ profile: req.user })
  }
}
