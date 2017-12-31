// @flow

jest.mock('../src/stores/TokenStore')
jest.mock('../src/stores/DataStore')

import request from 'supertest'
import debug from 'debug'
import _ from 'lodash'
import Api from '../src/Api'
import TokenStore from '../src/stores/TokenStore'
import DataStore from '../src/stores/DataStore'

import type { Debugger } from 'debug'
import type { User, Trip, CreateTripPayload, UpdateTripPayload } from '../src/util/types'

const mockUserData: Array<User> = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    facebookId: "432432",
    facebookAccessToken: "x4234x3",
    email: "john@smith.com",
    level: 1,
  },
  {
    id: 2,
    firstName: "Joe",
    lastName: "Bloggs",
    facebookId: "34324",
    facebookAccessToken: "432d234s343",
    email: "joe@bloggs.com",
    level: 2,
  },
  {
    id: 3,
    firstName: "Miraan",
    lastName: "Tabrez",
    facebookId: "324354654354",
    facebookAccessToken: "4jh3k2h4jk32hj43243k2kkh432",
    email: "miraan@miraan.co.uk",
    level: 3,
  },
]

const mockTripsData: Array<Trip> = [
  {
    id: 1,
    userId: 1,
    destination: "London",
    startDate: "2012-04-23T18:25:43.511Z",
    endDate: "2012-04-25T18:25:43.511Z",
    comment: "Excited for London!",
  },
  {
    id: 2,
    userId: 2,
    destination: "Paris",
    startDate: "2013-04-23T18:25:43.511Z",
    endDate: "2013-04-25T18:25:43.511Z",
    comment: "Excited for Paris!",
  },
  {
    id: 3,
    userId: 3,
    destination: "Tokyo",
    startDate: "2015-04-23T18:25:43.511Z",
    endDate: "2015-04-25T18:25:43.511Z",
    comment: "Excited for Tokyo!",
  },
]

const mockTokenStoreData = {
  'token1': 1,
  'token2': 2,
  'token3': 3,
}

TokenStore.mockImplementation(() => {
  return {
    getUserId: jest.fn().mockImplementation(token => {
      return Promise.resolve(mockTokenStoreData[token])
    }),
  }
})

DataStore.mockImplementation(() => {
  return {
    getUserById: jest.fn().mockImplementation(userId => {
      return Promise.resolve(mockUserData.find(user => user.id === userId))
    }),
    getUsers: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockUserData)
    }),
    createUser: jest.fn().mockImplementation(payload => {
      const newUserId = _.maxBy(mockUserData, user => user.id).id + 1
      const newUser: User = {
        id: newUserId,
        ...payload,
      }
      mockUserData.push(newUser)
      return Promise.resolve(newUser)
    }),
    updateUser: jest.fn().mockImplementation((userId, payload) => {
      const user: ?User = mockUserData.find(user => user.id === userId)
      if (!user) {
        return Promise.reject('No mock user with that ID.')
      }
      Object.assign(user, payload)
      return Promise.resolve(user)
    }),
    deleteUser: jest.fn().mockImplementation(userId => {
      const user: ?User = mockUserData.find(user => user.id === userId)
      if (!user) {
        return Promise.reject('No mock user with that ID.')
      }
      return Promise.resolve(user)
    }),
  }
})

const logger: Debugger = debug('jest-logger:')
const tokenStore: TokenStore = new TokenStore(logger)
const dataStore: DataStore = new DataStore(logger)
const app = new Api(logger, tokenStore, dataStore).express
