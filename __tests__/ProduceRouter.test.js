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

  describe('GET /api/v1/produce/:id - get produce item by id', () => {
    it('should return an object of type Produce', () =>
      request(app).get('/api/v1/produce/1')
      .expect(200)
      .then(res => {
        const reqKeys = ['id', 'name', 'price', 'quantity']
        const { item } = res.body;
        reqKeys.forEach(key => expect(Object.keys(item)).toContain(key))
        expect(typeof item.id).toBe('number')
        expect(typeof item.name).toBe('string')
        expect(typeof item.quantity).toBe('number')
        expect(typeof item.price).toBe('number')
      }))

    it('should return a Produce with the requested id', () =>
      request(app).get('/api/v1/produce/1')
      .expect(200)
      .then(res => expect(res.body.item).toEqual({
        id: 1,
        name: 'Carrots',
        quantity: 3,
        price: 0.79,
      })))

    it('should 400 on a request for a nonexistent id', () =>
      Promise.all([
        request(app).get('/api/v1/produce/-32')
        .expect(400)
        .then(res => expect(res.body.message).toBe('No item found with id: -32')),
        request(app).get('/api/v1/produce/99999')
        .expect(400)
        .then(res => expect(res.body.message).toBe('No item found with id: 99999'))
      ]))
  })

})
