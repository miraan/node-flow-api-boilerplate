// @flow

import { Router } from 'express'
import passport from 'passport'
import users from '../../data/users'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'

import type { Debugger } from 'debug'
import type { User } from '../util/types'

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

  init = () => {
    this.router.get('/me', passportBearerAuthenticated, this.getProfile)
    this.router.get('/', passportBearerAuthenticated, this.getAll)
  }

  getProfile = (req: $Request, res: $Response) => {
    res.status(200).json({
      success: true,
      content: {
        profile: req.user
      }
    })
  }

  getAll = (req: $Request, res: $Response) => {
    const user: User = req.user
    if (!user.level || user.level < 2) {
      res.status(401).send('Unauthorized')
      return
    }
    res.status(200).json({
      success: true,
      content: {
        users: users
      }
    })
  }

  getById(req: $Request, res: $Response): void {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).send('Unauthorized')
      return
    }
    const record = users.find(item => item.id === id)
    if (record) {
      res.status(200).json({

      })
    }
  }
}
