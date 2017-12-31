// @flow

jest.mock('../src/stores/TokenStore')
jest.mock('../src/stores/DataStore')
jest.mock('../src/FacebookClient')

import request from 'supertest'
import debug from 'debug'
import _ from 'lodash'
import Api from '../src/Api'
import TokenStore from '../src/stores/TokenStore'
import DataStore from '../src/stores/DataStore'
import FacebookClient from '../src/FacebookClient'

import type { Debugger } from 'debug'
import type { User, FacebookProfile } from '../src/util/types'

const mockUserData: Array<User> = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    facebookId: 'facebookId1',
    facebookAccessToken: 'expiredToken',
    email: 'john@smith.com',
    level: 1,
  },
]

const mockFacebookTokens: { [string]: string } = {
  'facebookShortToken1': 'facebookLongToken1',
  'facebookLongToken1': 'facebookLongToken1',
  'facebookShortToken2': 'facebookLongToken2',
  'facebookLongToken2': 'facebookLongToken2',
}

const mockFacebookProfile1: FacebookProfile = {
  facebookId: 'facebookId1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@smith.com',
}

const mockFacebookProfile2: FacebookProfile = {
  facebookId: 'facebookId2',
  firstName: 'Miraan',
  lastName: 'Tabrez',
  email: 'miraan@tabrez.com',
}

const mockFacebookProfiles: { [string]: FacebookProfile } = {
  'facebookShortToken1': mockFacebookProfile1,
  'facebookLongToken1': mockFacebookProfile1,
  'facebookShortToken2': mockFacebookProfile2,
  'facebookLongToken2': mockFacebookProfile2,
}

TokenStore.mockImplementation(() => {
  return {
    setToken: jest.fn().mockImplementation((token, userId) => {}),
  }
})

DataStore.mockImplementation(() => {
  return {
    getUserByFacebookId: jest.fn().mockImplementation(facebookId => {
      return Promise.resolve(mockUserData.find(user => user.facebookId === facebookId))
    }),
    createUser: jest.fn().mockImplementation(payload => {
      const newUserId = _.maxBy(mockUserData, user => user.id).id + 1
      const newUser: User = {
        id: newUserId,
        ...payload,
      }
      return Promise.resolve(newUser)
    }),
    updateUser: jest.fn().mockImplementation((userId, payload) => {
      const user: ?User = mockUserData.find(user => user.id === userId)
      if (!user) {
        return Promise.reject('No mock user with that ID.')
      }
      return Promise.resolve(Object.assign({}, user, payload))
    }),
  }
})

FacebookClient.mockImplementation(() => {
  return {
    extendFacebookAccessToken: jest.fn().mockImplementation(shortAccessToken => {
      if (!mockFacebookTokens[shortAccessToken]) {
        return Promise.reject('No mock facebook token for that short token.')
      }
      return Promise.resolve(mockFacebookTokens[shortAccessToken])
    }),
    getProfile: jest.fn().mockImplementation(accessToken => {
      if (!mockFacebookProfiles[accessToken]) {
        return Promise.reject('No mock facebook profile for that access token.')
      }
      return Promise.resolve(mockFacebookProfiles[accessToken])
    }),
  }
})

const logger: Debugger = debug('jest-logger:')
const tokenStore: TokenStore = new TokenStore(logger)
const dataStore: DataStore = new DataStore(logger)
const facebookClient: FacebookClient = new FacebookClient()
const app = new Api(logger, tokenStore, dataStore, facebookClient).express

describe('Login Routes', () => {

  describe('GET /api/v1/login/facebook - Facebook Login', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/login/facebook')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return an error if no facebook token is passed', () => {
      return request(app).get('/api/v1/login/facebook')
        .expect(200)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return an error if invalid facebook token is passed', () => {
      return request(app).get('/api/v1/login/facebook')
        .query({ facebookAccessToken: 'invalidFacebookToken' })
        .expect(200)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return a token and the existing user ID 1 with facebookLongToken1 ' +
      'if facebookShortToken1 is used', () => {
      return request(app).get('/api/v1/login/facebook')
        .query({ facebookAccessToken: 'facebookShortToken1' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.token).toEqual(expect.anything())
          const user: User = res.body.content.user
          expect(user.facebookAccessToken).toEqual('facebookLongToken1')
          user.facebookAccessToken = 'expiredToken'
          expect(user).toEqual(mockUserData[0])
        })
    })

    it('should return a token and a new user ID 2 with facebookLongToken2 ' +
      'if facebookShortToken2 is used', () => {
      return request(app).get('/api/v1/login/facebook')
        .query({ facebookAccessToken: 'facebookShortToken2' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.token).toEqual(expect.anything())
          const returnedNewUser: User = res.body.content.user
          const expectedNewUser: User = {
            id: 2,
            facebookAccessToken: 'facebookLongToken2',
            facebookId: 'facebookId2',
            firstName: 'Miraan',
            lastName: 'Tabrez',
            email: 'miraan@tabrez.com',
            level: 1,
          }
          expect(returnedNewUser).toEqual(expectedNewUser)
        })
    })

  })

})
