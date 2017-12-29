// @flow

import { Router } from 'express'
import FacebookClient from '../util/FacebookClient'
import crypto from 'crypto'
import path from 'path'
import users from '../../data/users'
import { saveItems, genId } from '../util/save'

import type { Debugger } from 'debug'
import type { RedisClient } from 'redis'
import type { User } from '../util/types'

export default class LoginRouter {
  router: Router
  path: string
  logger: Debugger
  redisClient: RedisClient
  facebookClient: FacebookClient

  constructor(redisClient: RedisClient, logger: Debugger, path: string = '/api/v1/login') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.redisClient = redisClient
    this.facebookClient = new FacebookClient()
    this.init()
  }

  init = () => {
    this.router.get('/facebook', this.facebookLogin)
  }

  facebookLogin = (req: $Request, res: $Response) => {
    const facebookAccessToken = req.query.facebookAccessToken
    if (!facebookAccessToken) {
      res.status(200).json({
        success: false,
        errorMessage: 'Facebook Access Token Required.'
      })
      return
    }
    const extendTokenPromise = this.facebookClient.extendFacebookAccessToken(facebookAccessToken)
    const getProfilePromise = extendTokenPromise.then(newFacebookAccessToken => {
      return this.facebookClient.getProfile(newFacebookAccessToken)
    })
    Promise.all([extendTokenPromise, getProfilePromise])
    .then(([newFacebookAccessToken, facebookProfile]) => {
      let user: User = users.find(user => user.facebookId === facebookProfile.facebookId)
      if (!user) {
        user = {
          id: genId(users),
          firstName: facebookProfile.firstName,
          lastName: facebookProfile.lastName,
          facebookId: facebookProfile.facebookId,
          email: facebookProfile.email,
          level: 1,
          facebookAccessToken: newFacebookAccessToken,
        }
        users.push(user)
      } else {
        user.facebookAccessToken = newFacebookAccessToken
      }
      const localToken = crypto.randomBytes(20).toString('hex')
      this.redisClient.set(localToken, user.id)
      res.status(200).json({
        success: true,
        content: {
          token: localToken
        }
      })
      return saveItems(users, 'users.json')
    })
    .then(writePath => {
      this.logger(`Users updated. Written to: ` +
        `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
    })
    .catch((error) => {
      res.status(200).json({
        success: false,
        errorMessage: 'Facebook Login Error: ' + error
      })
    })
  }
}
