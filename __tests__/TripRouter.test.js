// @flow

jest.mock('../src/stores/TokenStore')
jest.mock('../src/stores/DataStore')

import request from 'supertest'
import debug from 'debug'
import _ from 'lodash'
import Api from '../src/Api'
import TokenStore from '../src/stores/TokenStore'
import DataStore from '../src/stores/DataStore'
import FacebookClient from '../src/FacebookClient'

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
  {
    id: 4,
    userId: 1,
    destination: "Bali",
    startDate: "2016-04-23T18:25:43.511Z",
    endDate: "2016-04-25T18:25:43.511Z",
    comment: "Excited for Bali!",
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
    getTrips: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockTripsData)
    }),
    getTripsByUserId: jest.fn().mockImplementation(userId => {
      return Promise.resolve(_.filter(mockTripsData, trip => trip.userId === userId))
    }),
    getTripById: jest.fn().mockImplementation(tripId => {
      return Promise.resolve(mockTripsData.find(trip => trip.id === tripId))
    }),
    createTrip: jest.fn().mockImplementation((userId, payload) => {
      const newTripId = _.maxBy(mockTripsData, trip => trip.id).id + 1
      const newTrip: Trip = {
        id: newTripId,
        userId: userId,
        ...payload,
      }
      return Promise.resolve(newTrip)
    }),
    updateTrip: jest.fn().mockImplementation((tripId, payload) => {
      const trip: ?Trip = mockTripsData.find(trip => trip.id === tripId)
      if (!trip) {
        return Promise.reject('No mock trip with that ID.')
      }
      return Promise.resolve(Object.assign({}, trip, payload))
    }),
    deleteTrip: jest.fn().mockImplementation(tripId => {
      const trip: ?Trip = mockTripsData.find(trip => trip.id === tripId)
      if (!trip) {
        return Promise.reject('No mock trip with that ID.')
      }
      return Promise.resolve(trip)
    }),
  }
})

const logger: Debugger = debug('jest-logger:')
const tokenStore: TokenStore = new TokenStore(logger)
const dataStore: DataStore = new DataStore(logger)
const facebookClient: FacebookClient = new FacebookClient()
const app = new Api(logger, tokenStore, dataStore, facebookClient).express

describe('Trip Routes', () => {

  describe('GET /api/v1/trip/me - get own trips', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/trip/me')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {
      return request(app).get('/api/v1/trip/me')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if invalid token is used', () => {
      return request(app).get('/api/v1/trip/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return trips owned by user 1 if token 1 is used', () => {
      return request(app).get('/api/v1/trip/me')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const user1Trips = _.filter(mockTripsData, trip => trip.userId === 1)
          expect(res.body.content.trips).toEqual(user1Trips)
        })
    })

    it('should return trips owned by user 2 if token 2 is used', () => {
      return request(app).get('/api/v1/trip/me')
        .set('Authorization', 'Bearer token2')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const user2Trips = _.filter(mockTripsData, trip => trip.userId === 2)
          expect(res.body.content.trips).toEqual(user2Trips)
        })
    })

  })

  describe('GET /api/v1/trip/ - get all trips', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/trip/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {
      return request(app).get('/api/v1/trip/')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 1 is used', () => {
      return request(app).get('/api/v1/trip/')
        .set('Authorization', 'Bearer token1')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 2 is used', () => {
      return request(app).get('/api/v1/trip/')
        .set('Authorization', 'Bearer token2')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return an array of all trips if token 3 is used', () => {
      return request(app).get('/api/v1/trip/')
        .set('Authorization', 'Bearer token3')
        .expect(200)
        .then(res => expect(res.body.content.trips).toEqual(mockTripsData))
    })

  })

  describe('GET /api/v1/trip/:id - get a trip by ID', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return trip 1 if token 1 is used for trip ID 1', () => {
      return request(app).get('/api/v1/trip/1')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.trip).toEqual(mockTripsData[0])
        })
    })

    it('should return 401 if token 1 is used for trip ID 2', () => {
      return request(app).get('/api/v1/trip/2')
        .set('Authorization', 'Bearer token1')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 1 is used for trip ID 3', () => {
      return request(app).get('/api/v1/trip/3')
        .set('Authorization', 'Bearer token1')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return trip 4 if token 1 is used for trip ID 4', () => {
      return request(app).get('/api/v1/trip/4')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.trip).toEqual(mockTripsData[3])
        })
    })

    it('should return 401 if token 2 is used for trip ID 1', () => {
      return request(app).get('/api/v1/trip/1')
        .set('Authorization', 'Bearer token2')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return trip 1 if token 3 is used for trip ID 1', () => {
      return request(app).get('/api/v1/trip/1')
        .set('Authorization', 'Bearer token3')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.trip).toEqual(mockTripsData[0])
        })
    })

    it('should return 400 if token 3 is used for trip ID 99', () => {
      return request(app).get('/api/v1/trip/99')
        .set('Authorization', 'Bearer token3')
        .expect(400)
        .then(res => expect(res.body.success).toBe(false))
    })

  })

  describe('POST /api/v1/trip/ - create a new trip', () => {

    const createTripPayload: CreateTripPayload = {
      destination: "New York",
      startDate: "2018-04-23T18:25:43.511Z",
      endDate: "2018-04-25T18:25:43.511Z",
      comment: "Can't wait for New York!",
      userId: 1,
    }

    it('should return JSON', () => {
      return request(app).post('/api/v1/trip/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if token 1 is used', () => {
      return request(app).post('/api/v1/trip')
        .set('Authorization', 'Bearer token1')
        .send(createTripPayload)
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 2 is used', () => {
      return request(app).post('/api/v1/trip')
        .set('Authorization', 'Bearer token2')
        .send(createTripPayload)
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success and the payload data if token 3 is used', () => {
      return request(app).post('/api/v1/trip')
        .set('Authorization', 'Bearer token3')
        .send(createTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.id).toBeGreaterThan(4)
          delete returnedTrip.id
          expect(returnedTrip).toEqual(createTripPayload)
        })
    })

    it('should return 400 if token 3 is used with incomplete payload', () => {
      const incompletePayload = Object.assign({}, createTripPayload)
      delete incompletePayload.userId
      return request(app).post('/api/v1/trip')
        .set('Authorization', 'Bearer token3')
        .send(incompletePayload)
        .expect(400)
        .then(res => expect(res.body.success).toBe(false))
    })

  })

  describe('POST /api/v1/trip/me - create own trip', () => {

    const createTripPayload: CreateTripPayload = {
      destination: "New York",
      startDate: "2018-04-23T18:25:43.511Z",
      endDate: "2018-04-25T18:25:43.511Z",
      comment: "Can't wait for New York!",
    }

    it('should return JSON', () => {
      return request(app).post('/api/v1/trip/me')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {
      return request(app).post('/api/v1/trip/me')
        .send(createTripPayload)
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if invalid token is used', () => {
      return request(app).post('/api/v1/trip/me')
        .set('Authorization', 'Bearer invalidtoken')
        .send(createTripPayload)
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success and a user 1 owned trip if token 1 is used', () => {
      return request(app).post('/api/v1/trip/me')
        .set('Authorization', 'Bearer token1')
        .send(createTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.id).toBeGreaterThan(4)
          delete returnedTrip.id
          expect(returnedTrip.userId).toEqual(1)
          delete returnedTrip.userId
          expect(returnedTrip).toEqual(createTripPayload)
        })
    })

    it('should return success and a user 2 owned trip if token 2 is used', () => {
      return request(app).post('/api/v1/trip/me')
        .set('Authorization', 'Bearer token2')
        .send(createTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.id).toBeGreaterThan(4)
          delete returnedTrip.id
          expect(returnedTrip.userId).toEqual(2)
          delete returnedTrip.userId
          expect(returnedTrip).toEqual(createTripPayload)
        })
    })

    it('should return 400 if token 1 is used with incomplete payload', () => {
      const incompletePayload = Object.assign({}, createTripPayload)
      delete incompletePayload.comment
      return request(app).post('/api/v1/trip/me')
        .set('Authorization', 'Bearer token1')
        .send(incompletePayload)
        .expect(400)
        .then(res => expect(res.body.success).toBe(false))
    })

  })

  describe('PUT /api/v1/trip/:id - update a trip', () => {

    it('should return JSON', () => {
      return request(app).put('/api/v1/trip/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return success if token 1 is used on trip ID 1', () => {
      const updateTripPayload: UpdateTripPayload = { comment: "Really excited" }
      return request(app).put('/api/v1/trip/1')
        .set('Authorization', 'Bearer token1')
        .send(updateTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.comment).toEqual(updateTripPayload.comment)
        })
    })

    it('should return 401 if token 1 is used on trip ID 2', () => {
      return request(app).put('/api/v1/trip/2')
        .set('Authorization', 'Bearer token1')
        .send({ comment: "Really excited" })
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 1 is used on trip ID 3', () => {
      return request(app).put('/api/v1/trip/3')
        .set('Authorization', 'Bearer token1')
        .send({ comment: "Really excited" })
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success if token 1 is used on trip ID 4', () => {
      const updateTripPayload: UpdateTripPayload = { comment: "Really excited" }
      return request(app).put('/api/v1/trip/4')
        .set('Authorization', 'Bearer token1')
        .send(updateTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.comment).toEqual(updateTripPayload.comment)
        })
    })

    it('should return 401 if token 2 is used on trip ID 1', () => {
      return request(app).put('/api/v1/trip/1')
        .set('Authorization', 'Bearer token2')
        .send({ comment: "Really excited" })
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success if token 3 is used on trip ID 1', () => {
      const updateTripPayload: UpdateTripPayload = { comment: "Really excited" }
      return request(app).put('/api/v1/trip/1')
        .set('Authorization', 'Bearer token3')
        .send(updateTripPayload)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip.comment).toEqual(updateTripPayload.comment)
        })
    })

    it('should return 404 if token 3 is used with invalid payload', () => {
      const invalidPayload = { comment1: "Really excited" }
      return request(app).put('/api/v1/trip/1')
        .set('Authorization', 'Bearer token3')
        .send(invalidPayload)
        .expect(400)
        .then(res => expect(res.body.success).toBe(false))
    })

  })

  describe('DELETE /api/v1/trip/:id - delete a trip', () => {

    it('should return JSON', () => {
      return request(app).delete('/api/v1/trip/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return success if token 1 is used on trip ID 1', () => {
      return request(app).delete('/api/v1/trip/1')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip).toEqual(mockTripsData[0])
        })
    })

    it('should return 401 if token 1 is used on trip ID 2', () => {
      return request(app).delete('/api/v1/trip/2')
        .set('Authorization', 'Bearer token1')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if token 1 is used on trip ID 3', () => {
      return request(app).delete('/api/v1/trip/3')
        .set('Authorization', 'Bearer token1')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success if token 1 is used on trip ID 4', () => {
      return request(app).delete('/api/v1/trip/4')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip).toEqual(mockTripsData[3])
        })
    })

    it('should return 401 if token 2 is used on trip ID 1', () => {
      return request(app).delete('/api/v1/trip/1')
        .set('Authorization', 'Bearer token2')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return success if token 3 is used on trip ID 1', () => {
      return request(app).delete('/api/v1/trip/1')
        .set('Authorization', 'Bearer token3')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          const returnedTrip: Trip = res.body.content.trip
          expect(returnedTrip).toEqual(mockTripsData[0])
        })
    })

  })

})
