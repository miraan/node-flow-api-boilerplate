// @flow

import { Router } from 'express'
import passport from 'passport'
import path from 'path'
import _ from 'lodash'
import users from '../../data/users'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'
import { parseCreateUserPayload, parseUpdateUserPayload } from '../util/parsers'
import { saveUsers, genUserId } from '../util/save'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload, UpdateUserPayload } from '../util/types'

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
    this.router.put('/:id', passportBearerAuthenticated, this.updateById)
    this.router.delete('/:id', passportBearerAuthenticated, this.removeById)
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
    const record: User = users.find(item => item.id === id)
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
    this.saveUsersFile()
  }

  updateById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const record: User = users.find(item => item.id === id)
    if (!record) {
      res.status(400).json({
        success: false,
        errorMessage: 'No user with that ID exists.'
      })
      return
    }
    const payload: ?UpdateUserPayload = parseUpdateUserPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid update user payload.'
      })
      return
    }
    const newData: CreateUserPayload = {
      firstName: payload.firstName || record.firstName,
      lastName: payload.lastName || record.lastName,
      facebookId: payload.facebookId || record.facebookId,
      facebookAccessToken: payload.facebookAccessToken || record.facebookAccessToken,
      email: payload.email || record.email,
      level: payload.level || record.level,
    }
    Object.assign(record, newData)
    res.status(200).json({
      success: true,
      content: {
        user: record
      }
    })
    this.saveUsersFile()
  }

  removeById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const recordIndex: number = users.findIndex(item => item.id === id)
    if (recordIndex === -1) {
      res.status(400).json({
        success: false,
        errorMessage: 'No user with that ID exists.'
      })
      return
    }
    const deletedRecord = users.splice(recordIndex, 1)[0]
    res.status(200).json({
      success: true,
      content: {
        user: deletedRecord
      }
    })
    this.saveUsersFile()
  }

  saveUsersFile = () => {
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
