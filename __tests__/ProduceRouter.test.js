import request from 'supertest'
import Api from '../src/Api'

const app = new Api().express

describe('Node Flow API', () => {

  describe('GET /api/v1/produce - get all produce', () => {
    let expectedProps = ['id', 'name', 'quantity', 'price']

    it('should return a JSON array', () =>
      request(app).get('/api/v1/produce')
        .expect(200)
        .then(res => expect(res.body).toBeInstanceOf(Array)))

    it('should return objects with the correct props', () =>
      request(app).get('/api/v1/produce')
        .expect(200)
        .then(res => {
          let sampleKeys = Object.keys(res.body[0])
          expectedProps.forEach(key =>
            expect(sampleKeys.includes(key)).toBe(true))
        }))

    it('shouldn\'t return objects with extra props', () =>
      request(app).get('/api/v1/produce')
        .expect(200)
        .then(res => {
          let extraProps = Object.keys(res.body[0]).filter(key =>
            !expectedProps.includes(key))
          expect(extraProps.length).toBe(0)
        }))
  })

})
