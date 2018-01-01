// @flow

import request from 'supertest'
import debug from 'debug'
import _ from 'lodash'
import Api from '../src/Api'
import TokenStore from '../src/stores/TokenStore'
import DataStore from '../src/stores/DataStore'
import FacebookClient from '../src/FacebookClient'
import ServerConfigurationObject from '../src/configuration'

import type { Debugger } from 'debug'
import type { User, Trip, CreateUserPayload, CreateTripPayload } from '../src/util/types'

const logger: Debugger = debug('jest-logger:')
const tokenStore: TokenStore = new TokenStore(logger)
const dataStore: DataStore = new DataStore(logger)
const facebookClient: FacebookClient = new FacebookClient()
const app = new Api(logger, tokenStore, dataStore, facebookClient).express

var authenticationToken: string = ''
var testUser: User = {
  id: '',
  firstName: '',
  lastName: '',
  facebookId: '',
  facebookAccessToken: '',
  email: '',
  level: 1,
}
var testTrip: Trip = {
  id: '',
  userId: '',
  destination: '',
  startDate: '',
  endDate: '',
  comment: '',
}

const createUserPayload: CreateUserPayload = {
  firstName: 'Joe',
  lastName: 'Bloggs',
  facebookId: 'fakefacebookid',
  facebookAccessToken: 'fakefacebookAccessToken',
  email: 'joe@bloggs.com',
  level: 1,
}

const createTripPayload: CreateTripPayload = {
  destination: 'London',
  startDate: '2012-04-23T18:25:43.511Z',
  endDate: '2012-05-23T18:25:43.511Z',
  comment: 'Excited for London!',
}

beforeAll(() => {
  return dataStore.deleteAllData()
})

describe('Integration Test', () => {

  it('should return a new user on login with a valid fb access token', () => {
    return request(app).get('/api/v1/login/facebook')
      .query({
        facebookAccessToken: ServerConfigurationObject.testUserFacebookAccessToken
      })
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        authenticationToken = res.body.content.token
        testUser = res.body.content.user
        expect(authenticationToken).toEqual(expect.anything())
        expect(testUser.id).toEqual(expect.anything())
      })
  })

  it('should return the same user and not create a new one on next login', () => {
    return request(app).get('/api/v1/login/facebook')
      .query({ facebookAccessToken: testUser.facebookAccessToken })
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        testUser.facebookAccessToken = res.body.content.user.facebookAccessToken
        expect(res.body.content.user).toEqual(testUser)
      })
  })

  it('should return correct user profile on own profile request', () => {
    return request(app).get('/api/v1/user/me')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        expect(res.body.content.user).toEqual(testUser)
      })
  })

  it('should return an empty array for getting own trips', () => {
    return request(app).get('/api/v1/trip/me')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        expect(res.body.content.trips).toBeInstanceOf(Array)
        expect(res.body.content.trips.length).toEqual(0)
      })
  })

  it('should return 401 for getting all users', () => {
    return request(app).get('/api/v1/user/')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(401)
      .then(res => {
        expect(res.body.success).toBe(false)
      })
  })

  it('should return 401 for getting all trips', () => {
    return request(app).get('/api/v1/trip/')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(401)
      .then(res => {
        expect(res.body.success).toBe(false)
      })
  })

  it('should return 401 for creating user with general endpoint', () => {
    return request(app).post('/api/v1/user/')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .send(createUserPayload)
      .expect(401)
      .then(res => {
        expect(res.body.success).toBe(false)
      })
  })

  it('should return 401 for creating trip with general endpoint', () => {
    return request(app).post('/api/v1/trip/')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .send(createTripPayload)
      .expect(401)
      .then(res => {
        expect(res.body.success).toBe(false)
      })
  })

  it('should allow updating own profile', () => {
    const newEmail = 'miraan@tabrez.com'
    return request(app).put('/api/v1/user/' + testUser.id)
      .set('Authorization', 'Bearer ' + authenticationToken)
      .send({ email: newEmail })
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        return request(app).get('/api/v1/user/me')
          .set('Authorization', 'Bearer ' + authenticationToken)
          .expect(200)
      })
      .then(res => {
        expect(res.body.success).toBe(true)
        testUser = res.body.content.user
        expect(testUser.email).toEqual(newEmail)
      })
  })

  it('should allow creating own trip', () => {
    return request(app).post('/api/v1/trip/me')
      .set('Authorization', 'Bearer ' + authenticationToken)
      .send(createTripPayload)
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        return request(app).get('/api/v1/trip/me')
          .set('Authorization', 'Bearer ' + authenticationToken)
          .expect(200)
      })
      .then(res => {
        expect(res.body.success).toBe(true)
        expect(res.body.content.trips).toBeInstanceOf(Array)
        expect(res.body.content.trips.length).toEqual(1)
        testTrip = res.body.content.trips[0]
        expect(testTrip.id).toEqual(expect.anything())
        expect(testTrip.userId).toEqual(testUser.id)
        expect(testTrip).toEqual(Object.assign({}, {
          'id': testTrip.id,
          'userId': testUser.id,
        }, createTripPayload))
      })
  })

  it('should allow updating own trip', () => {
    return request(app).put('/api/v1/trip/' + testTrip.id)
      .set('Authorization', 'Bearer ' + authenticationToken)
      .send({ destination: 'New York' })
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        return request(app).get('/api/v1/trip/me')
          .set('Authorization', 'Bearer ' + authenticationToken)
          .expect(200)
      })
      .then(res => {
        expect(res.body.success).toBe(true)
        expect(res.body.content.trips).toBeInstanceOf(Array)
        expect(res.body.content.trips.length).toEqual(1)
        expect(res.body.content.trips[0].id).toEqual(testTrip.id)
        testTrip = res.body.content.trips[0]
        expect(testTrip.destination).toEqual('New York')
      })
  })

  it('should allow deleting own trip', () => {
    return request(app).delete('/api/v1/trip/' + testTrip.id)
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        return request(app).get('/api/v1/trip/me')
          .set('Authorization', 'Bearer ' + authenticationToken)
          .expect(200)
      })
      .then(res => {
        expect(res.body.success).toBe(true)
        expect(res.body.content.trips).toBeInstanceOf(Array)
        expect(res.body.content.trips.length).toEqual(0)
      })
  })

  it('should allow deleting own user account', () => {
    return request(app).delete('/api/v1/user/' + testUser.id)
      .set('Authorization', 'Bearer ' + authenticationToken)
      .expect(200)
      .then(res => {
        expect(res.body.success).toBe(true)
        return request(app).get('/api/v1/user/me')
          .set('Authorization', 'Bearer ' + authenticationToken)
          .expect(401)
      })
      .then(res => {
        expect(res.body.success).toBe(false)
      })
  })

})
