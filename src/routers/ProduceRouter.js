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
  }

  getAll(req: $Request, res: $Response): void {
    res.status(200).json(inventory)
  }
}
