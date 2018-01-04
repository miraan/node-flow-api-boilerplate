// @flow

import { Router } from 'express'
import path from 'path'
import _ from 'lodash'
import DataStore from '../stores/DataStore'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'
import { parseCreateUserPayload, parseUpdateUserPayload } from '../util/parsers'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload, UpdateUserPayload } from '../util/types'

export default class UserRouter {
  router: Router
  path: string
  logger: Debugger
  dataStore: DataStore

  constructor(logger: Debugger, dataStore: DataStore, path: string = '/api/v1/user') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.dataStore = dataStore
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
    this.dataStore.getUsers().then(users => {
      res.status(200).json({
        success: true,
        content: {
          users: users
        }
      })
    })
    .catch(error => {
      this.logger('UserRouter getAll Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error getting users.'
      })
    })
  }

  getById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    this.dataStore.getUserById(id).then(record => {
      if (!record) {
        res.status(400).json({
          success: false,
          errorMessage: 'No user with that ID exists.'
        })
        return Promise.reject(null)
      }
      res.status(200).json({
        success: true,
        content: {
          user: record
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('UserRouter getById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error getting user.'
      })
    })
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
    payload.level = Math.min(payload.level, user.level)
    this.dataStore.createUser(payload).then(newUser => {
      res.status(200).json({
        success: true,
        content: {
          user: newUser
        }
      })
    })
    .catch(error => {
      this.logger('UserRouter postOne Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error creating user.'
      })
    })
  }

  updateById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    this.dataStore.getUserById(id).then(record => {
      if (!record) {
        res.status(400).json({
          success: false,
          errorMessage: 'No user with that ID exists.'
        })
        return Promise.reject(null)
      }
      if (record.id !== user.id && record.level >= user.level && user.level < 3) {
        res.status(401).json({
          success: false,
          errorMessage: 'Unauthorized.'
        })
        return Promise.reject(null)
      }
      const payload: ?UpdateUserPayload = parseUpdateUserPayload(req.body)
      if (!payload) {
        res.status(400).json({
          success: false,
          errorMessage: 'Invalid update user payload.'
        })
        return Promise.reject(null)
      }
      return this.dataStore.updateUser(record.id, payload)
    })
    .then(record => {
      res.status(200).json({
        success: true,
        content: {
          user: record
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('UserRouter updateById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error updating user.'
      })
    })
  }

  removeById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    if (user.id !== id && (!user.level || user.level < 2)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    this.dataStore.getUserById(id).then(record => {
      if (!record) {
        res.status(400).json({
          success: false,
          errorMessage: 'No user with that ID exists.'
        })
        return Promise.reject(null)
      }
      if (record.id !== user.id && record.level >= user.level && user.level < 3) {
        res.status(401).json({
          success: false,
          errorMessage: 'Unauthorized.'
        })
        return Promise.reject(null)
      }
      return this.dataStore.deleteUser(record.id)
    })
    .then(deletedUser => {
      res.status(200).json({
        success: true,
        content: {
          user: deletedUser
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('UserRouter removeById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error updating user.'
      })
    })
  }
}
