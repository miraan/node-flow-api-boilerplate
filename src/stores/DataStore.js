// @flow

import users from '../../data/users'
import path from 'path'
import _ from 'lodash'
import { saveItems, genId } from '../util/save'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload, UpdateUserPayload } from '../util/types'

export default class DataStore {
  logger: Debugger

  constructor(logger: Debugger) {
    this.logger = logger
  }

  getUsers: () => Promise<Array<User>> = () => {
    return new Promise((resolve, reject) => {
      resolve(users)
    })
  }

  getUserById: number => Promise<?User> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.id === userId)
      if (!user) {
        resolve(null)
        return
      }
      resolve(user)
    })
  }

  getUserByFacebookId: string => Promise<?User> = (facebookId: string) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.facebookId === facebookId)
      if (!user) {
        resolve(null)
        return
      }
      resolve(user)
    })
  }

  createUser: CreateUserPayload => Promise<User> = (payload: CreateUserPayload) => {
    return new Promise((resolve, reject) => {
      const user: User = {
        ...payload,
        id: genId(users),
      }
      users.push(user)
      this._saveUsers().then(writePath => {
        resolve(user)
      })
      .catch(error => {
        reject('DataStore createUser error: ' + error)
      })
    })
  }

  updateUser: (number, UpdateUserPayload) => Promise<User> =
  (userId: number, payload: UpdateUserPayload) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.id === userId)
      if (!user) {
        reject('DataStore updateUser error: No user found with given userId.')
        return
      }
      // $FlowFixMe
      Object.assign(user, payload)
      this._saveUsers().then(writePath => {
        resolve(user)
      })
      .catch(error => {
        reject('DataStore updateUser error: ' + error)
      })
    })
  }

  deleteUser: number => Promise<User> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const index: number = users.findIndex(user => user.id === userId)
      if (index === -1) {
        reject('DataStore deleteUser error: No user found with given userId.')
        return
      }
      const deletedRecord = users.splice(index, 1)[0]
      this._saveUsers().then(writePath => {
        resolve(deletedRecord)
      })
      .catch(error => {
        reject('DataStore deleteUser error: ' + error)
      })
    })
  }

  _saveUsers: () => Promise<string> = () => {
    return new Promise((resolve, reject) => {
      saveItems(users, 'users.json').then(writePath => {
        this.logger(`Users updated. Written to: ` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
        resolve(writePath)
      })
      .catch(error => {
        reject('DataStore _saveUsers error: ' + error)
      })
    })
  }
}
