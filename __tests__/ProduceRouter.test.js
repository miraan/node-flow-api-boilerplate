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
        const { item } = res.body
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

  describe('POST /api/v1/produce - create new item', () => {
    let peach = {
      name: 'peach',
      quantity: 10,
      price: 6.5
    }

    it('should accept and add a valid new item', () =>
      request(app).post('/api/v1/produce')
      .send(peach)
      .then(res => {
        expect(res.body.status).toBe(200)
        expect(res.body.message).toBe('Success')
        return request(app).get('/api/v1/produce')
      })
      .then(res => {
        let returnedPeach = res.body.find(item => item.name === 'peach')
        expect(res.status).toBe(200)
        expect(returnedPeach.quantity).toBe(10)
        expect(returnedPeach.price).toBe(6.5)
      }))

    it('should reject a post without a name, price or quantity', () => {
      let badItems = [
        {
          name: peach.name,
          quantity: peach.quantity
        },
        {
          quantity: peach.quantity,
          price: peach.price
        },
        {
          name: peach.name,
          price: peach.price
        }
      ]
      return Promise.all(badItems.map(badItem =>
        request(app).post('/api/v1/produce')
        .send(badItem)
        .then(res => {
          expect(res.body.status).toBe(400)
          expect(res.body.message.startsWith('Bad Request')).toBe(true)
        })))
    })
  })

  describe('PUT /api/v1/produce/:id - update an item', () => {
    it('allows updates to props other than id', () =>
      request(app).put('/api/v1/produce/1')
      .send({ quantity: 20 })
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Success')
        expect(res.body.item.quantity).toBe(20)
        return request(app).get('/api/v1/produce/1')
      })
      .then(res => expect(res.body.item.quantity).toBe(20)))

    it('rejects updates to id prop', () =>
      request(app).put('/api/v1/produce/1')
      .send({ id: 10 })
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.body.message.startsWith('Update failed')).toBe(true)
      }))
  })

  describe('DELETE /api/v1/produce/:id - delete an item', () => {
    it('deletes when given a valid ID', () =>
      request(app).delete('/api/v1/produce/3')
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('Success')
        expect(res.body.deleted.id).toBe(3)
      }))

    it('responds with an error if given an invalid ID', () =>
      Promise.all([-2, 100].map(id =>
        request(app).delete(`/api/v1/produce/${id}`)
        .then(res => {
          expect(res.status).toBe(400)
          expect(res.body.message).toBe('No item found with given ID')
        }))))
  })

})
