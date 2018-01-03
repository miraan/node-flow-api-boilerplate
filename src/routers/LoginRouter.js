// @flow

import { Router } from 'express'
import FacebookClient from '../FacebookClient'
import path from 'path'
import TokenStore from '../stores/TokenStore'
import DataStore from '../stores/DataStore'
import { encrypt, decrypt } from '../util/encryption'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload } from '../util/types'

export default class LoginRouter {
  router: Router
  path: string
  logger: Debugger
  tokenStore: TokenStore
  dataStore: DataStore
  facebookClient: FacebookClient

  constructor(
    logger: Debugger,
    tokenStore: TokenStore,
    dataStore: DataStore,
    facebookClient: FacebookClient,
    path: string = '/api/v1/login'
  ) {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.tokenStore = tokenStore
    this.dataStore = dataStore
    this.facebookClient = facebookClient
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
    const getFacebookProfilePromise = this.facebookClient.getProfile(facebookAccessToken)
    const getUserPromise = getFacebookProfilePromise.then(facebookProfile => {
      return this.dataStore.getUserByFacebookId(facebookProfile.facebookId)
    })
    Promise.all([extendTokenPromise, getFacebookProfilePromise, getUserPromise])
    .then(([newFacebookAccessToken, facebookProfile, user]) => {
      if (!user) {
        const createUserPayload: CreateUserPayload = {
          firstName: facebookProfile.firstName,
          lastName: facebookProfile.lastName,
          facebookId: facebookProfile.facebookId,
          email: facebookProfile.email,
          level: 1,
          facebookAccessToken: newFacebookAccessToken,
        }
        return this.dataStore.createUser(createUserPayload)
      } else {
        return this.dataStore.updateUser(user.id, {
          facebookAccessToken: newFacebookAccessToken,
        })
      }
    })
    .then(user => {
      const localToken = encrypt(user.id)
      this.tokenStore.setToken(localToken, user.id)
      res.status(200).json({
        success: true,
        content: {
          token: localToken,
          user: user,
        }
      })
    })
    .catch(error => {
      res.status(200).json({
        success: false,
        errorMessage: 'Facebook Login Error: ' + error
      })
    })
  }
}
