// @flow

import users from '../../data/users'

import type { Debugger } from 'debug'
import type { User } from '../util/types'

export default class DataStore {
  logger: Debugger

  constructor(logger: Debugger) {
    this.logger = logger
  }

  getUsers: () => Promise<?Array<User>> = () => {
    return new Promise((resolve, reject) => {
      resolve(users)
    })
  }

  getUser: number => Promise<?User> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.id === userId)
      if (!user) {
        resolve(null)
        return
      }
      resolve(user)
    })
  }
}
