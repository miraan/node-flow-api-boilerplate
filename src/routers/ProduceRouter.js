// @flow

import { inventory } from '../../data/produce'
import { Router } from 'express'

export default class ProduceRouter {
  router: Router
  path: string

  constructor(path: string = '/api/v1/produce') {
    this.router = Router()
    this.path = path
    this.init()
  }

  init(): void {
    this.router.get('/', this.getAll)
    this.router.get('/:id', this.getById)
  }

  getAll(req: $Request, res: $Response): void {
    res.status(200).json(inventory)
  }

  getById(req: $Request, res: $Response): void {
    const id = parseInt(req.params.id, 10)
    const record = inventory.find(item => item.id === id)
    if (record) {
      res.status(200).json({
        message: 'Success',
        item: record
      })
    } else {
      res.status(400).json({
        status: res.status,
        message: `No item found with id: ${id}`
      })
    }
  }
}
