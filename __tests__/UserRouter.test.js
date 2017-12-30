// @flow

jest.mock('../src/stores/TokenStore')
jest.mock('../src/stores/DataStore')

import request from 'supertest'
import debug from 'debug'
import Api from '../src/Api'
import TokenStore from '../src/stores/TokenStore'
import DataStore from '../src/stores/DataStore'

import type { Debugger } from 'debug'
import type { User } from '../src/util/types'

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

const mockTokenStoreData = {
  'token1': 1,
  'token2': 2,
  'token3': 3,
}

const mockTokenStoreGetUserId = jest.fn().mockImplementation(token => {
  const userId = mockTokenStoreData[token]
  if (userId) {
    return Promise.resolve(userId)
  }
  return Promise.resolve(null)
})
TokenStore.mockImplementation(() => {
  return {
    getUserId: mockTokenStoreGetUserId,
  }
})

const mockDataStoreGetUsers = jest.fn().mockImplementation(() => {
  return Promise.resolve(mockUserData)
})
const mockDataStoreGetUser = jest.fn().mockImplementation(userId => {
  const user: ?User = mockUserData.find(user => user.id === userId)
  if (!user) {
    return Promise.resolve(null)
  }
  return Promise.resolve(user)
})
DataStore.mockImplementation(() => {
  return {
    getUsers: mockDataStoreGetUsers,
    getUser: mockDataStoreGetUser,
  }
})

const logger: Debugger = debug('jest-logger:')
const tokenStore: TokenStore = new TokenStore()
const dataStore: DataStore = new DataStore()
const app = new Api(logger, tokenStore, dataStore).express

describe('User Routes', () => {

  describe('GET /api/v1/user/me - get own profile', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/user/me')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {
      return request(app).get('/api/v1/user/me')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return 401 if invalid token is used', () => {
      return request(app).get('/api/v1/user/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)
        .then(res => expect(res.body.success).toBe(false))
    })

    it('should return user 1 if token 1 is used', () => {
      return request(app).get('/api/v1/user/me')
        .set('Authorization', 'Bearer token1')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true)
          expect(res.body.content.user).toEqual(mockUserData[0])
        })
    })

    // it('should return user 2 if token 2 is used', () => {
    //
    // })

  })

  describe('GET /api/v1/user/ - get all users', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/user/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    // it('should return 401 if no token is used', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used', () => {
    //
    // })
    //
    // it('should return an array of all users if token 2 is used', () => {
    //
    // })
    //
    // it('should return an array of all users if token 3 is used', () => {
    //
    // })

  })

  describe('GET /api/v1/user/:id - get a user 2y ID', () => {

    it('should return JSON', () => {
      return request(app).get('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    // it('should return user 1 if token 1 is used for ID 1', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used for ID 2', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used for ID 3', () => {
    //
    // })
    //
    // it('should return user 1 if token 2 is used for ID 1', () => {
    //
    // })
    //
    // it('should return user 1 if token 3 is used for ID 1', () => {
    //
    // })
    //
    // it('should return user 3 if token 2 is used for ID 3', () => {
    //
    // })
    //
    // it('should return 400 if token 3 is used with ID 99', () => {
    //
    // })

  })

  describe('POST /api/v1/user/ - create a new user', () => {

    it('should return JSON', () => {
      return request(app).post('/api/v1/user/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    // it('should return 401 if token 1 is used', () => {
    //
    // })
    //
    // it('should return 400 if token 2 is used with incomplete payload', () => {
    //
    // })
    //
    // it('should return success if token 2 is used', () => {
    //
    // })
    //
    // it('should return success if token 3 is used', () => {
    //
    // })

  })

  describe('PUT /api/v1/user/:id - update a user', () => {

    it('should return JSON', () => {
      return request(app).put('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    // it('should return success if token 1 is used on ID 1', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used on ID 2', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used on ID 3', () => {
    //
    // })
    //
    // it('should return 401 if token 2 is used on ID 3', () => {
    //
    // })
    //
    // it('should return success if token 2 is used on ID 1', () => {
    //
    // })
    //
    // it('should return success if token 3 is used on ID 2', () => {
    //
    // })

  })

  describe('DELETE /api/v1/user/:id - delete a user', () => {

    it('should return JSON', () => {
      return request(app).delete('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    // it('should return success if token 1 is used on ID 1', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used on ID 2', () => {
    //
    // })
    //
    // it('should return 401 if token 1 is used on ID 3', () => {
    //
    // })
    //
    // it('should return 401 if token 2 is used on ID 3', () => {
    //
    // })
    //
    // it('should return success if token 2 is used on ID 1', () => {
    //
    // })
    //
    // it('should return success if token 3 is used on ID 2', () => {
    //
    // })

  })

})