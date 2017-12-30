import request from 'supertest'
import Api from '../src/Api'
import debug from 'debug'

import type { Debugger } from 'debug'

const logger: Debugger = debug('jest-logger:')
const app: Api = new Api(logger).express

describe('User Routes', () => {

  describe('GET /api/v1/user/me - get own profile', () => {

    it('should return JSON', () => {
      request(app).get('/api/v1/user/me')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {
      request(app).get('/api/v1/user/me')
        .expect(401)
    })

    it('should return 401 if invalid token is used', () => {
      request(app).get('/api/v1/user/me')
        .set('Authorization', 'Bearer 563782bc8f333777457d2cef114efcb14052cec1')
        .expect(200)
    })

    it('should return user A if token A is used', () => {

    })

    it('should return user B if token B is used', () => {

    })

  })

  describe('GET /api/v1/user/ - get all users', () => {

    it('should return JSON', () => {
      request(app).get('/api/v1/user/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if no token is used', () => {

    })

    it('should return 401 if token A is used', () => {

    })

    it('should return an array of all users if token B is used', () => {

    })

    it('should return an array of all users if token C is used', () => {

    })

  })

  describe('GET /api/v1/user/:id - get a user by ID', () => {

    it('should return JSON', () => {
      request(app).get('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return user A if token A is used for ID 1', () => {

    })

    it('should return 401 if token A is used for ID 2', () => {

    })

    it('should return 401 if token A is used for ID 3', () => {

    })

    it('should return user A if token B is used for ID 1', () => {

    })

    it('should return user A if token C is used for ID 1', () => {

    })

    it('should return user C if token B is used for ID 3', () => {

    })

    it('should return 400 if token C is used with ID 99', () => {

    })

  })

  describe('POST /api/v1/user/ - create a new user', () => {

    it('should return JSON', () => {
      request(app).post('/api/v1/user/')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return 401 if token A is used', () => {

    })

    it('should return 400 if token B is used with incomplete payload', () => {

    })

    it('should return success if token B is used', () => {

    })

    it('should return success if token C is used', () => {

    })

  })

  describe('PUT /api/v1/user/:id - update a user', () => {

    it('should return JSON', () => {
      request(app).put('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return success if token A is used on ID 1', () => {

    })

    it('should return 401 if token A is used on ID 2', () => {

    })

    it('should return 401 if token A is used on ID 3', () => {

    })

    it('should return 401 if token B is used on ID 3', () => {

    })

    it('should return success if token B is used on ID 1', () => {

    })

    it('should return success if token C is used on ID 2', () => {

    })

  })

  describe('DELETE /api/v1/user/:id - delete a user', () => {

    it('should return JSON', () => {
      request(app).delete('/api/v1/user/1')
        .expect('Content-Type', /json/)
        .then(res => expect(res.body).toBeInstanceOf(Object))
    })

    it('should return success if token A is used on ID 1', () => {

    })

    it('should return 401 if token A is used on ID 2', () => {

    })

    it('should return 401 if token A is used on ID 3', () => {

    })

    it('should return 401 if token B is used on ID 3', () => {

    })

    it('should return success if token B is used on ID 1', () => {

    })

    it('should return success if token C is used on ID 2', () => {

    })

  })

})
