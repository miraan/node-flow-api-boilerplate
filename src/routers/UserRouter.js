// @flow

import { Router } from 'express'
import passport from 'passport'
import path from 'path'
import users from '../../data/users'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'
import { parseCreateUserPayload } from '../util/parsers'
import { saveUsers, genUserId } from '../util/save'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload } from '../util/types'

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
    this.router.get('/:id', passportBearerAuthenticated, this.getById)
    this.router.post('/', passportBearerAuthenticated, this.postOne)
  }

  getProfile = (req: $Request, res: $Response) => {
    res.status(200).json({
      success: true,
      content: {
        user: req.user
      }
    })
  }

  getAll = (req: $Request, res: $Response) => {
    const user: User = req.user
    if (!user.level || user.level < 2) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    res.status(200).json({
      success: true,
      content: {
        users: users
      }
    })
  }

  getById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const record = users.find(item => item.id === id)
    if (record) {
      res.status(200).json({
        success: true,
        content: {
          user: record
        }
      })
    } else {
      res.status(400).json({
        success: false,
        errorMessage: 'No user with that ID exists.'
      })
    }
  }

  postOne = (req: $Request, res: $Response) => {
    const user: User = req.user
    if (!user.level || user.level < 2) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const payload: ?CreateUserPayload = parseCreateUserPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid create user payload.'
      })
      return
    }
    const newUser: User = {
      ...payload,
      id: genUserId(users)
    }
    users.push(newUser)
    res.status(200).json({
      success: true,
      content: {
        user: newUser
      }
    })
    saveUsers(users)
    .then(writePath => {
      this.logger(`Users updated. Written to:\n\t` +
        `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
    })
    .catch(err => {
      this.logger('Error writing to users file.')
      this.logger(err.stack)
    })
  }
}
