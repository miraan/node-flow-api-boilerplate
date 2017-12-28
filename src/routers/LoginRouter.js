// @flow

import { Router } from 'express'

import type { Debugger } from 'debug'

export default class LoginRouter {
  router: Router
  path: string
  logger: Debugger

  constructor(logger: Debugger, path: string = '/api/v1/login') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.init()
  }

  init(): void {
    this.router.get('/facebook', this.facebookLogin)
  }

  facebookLogin(req: $Request, res: $Response): void {
    const facebookAccessToken: string = req.query.facebookAccessToken
    if (!facebookAccessToken) {
      res.json({ error: 'Invalid facebook access token.' })
    } else {
      res.json({ token: '12345' })
    }
    /* TODO
        1. Get long lived access token from Facebook, return error if this fails
        2. Get Facebook user profile with new access token, return error if this fails
        3. Retrive user from DB with matching Facebook User ID
        4. If the user exists, update their facebookAccessToken field with the new long lived token
           Else, create a new user record with their facebook profile and the new long lived token
        5. Generate a localToken and put as key in Redis Cache with value as their user ID
        6. Return this localToken
    */
  }
}
