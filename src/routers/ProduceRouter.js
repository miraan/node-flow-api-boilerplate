// @flow

import inventory from '../../data/produce'
import { Router } from 'express'
import path from 'path'
import { saveInventory, genProduceId } from '../util/save'
import { parseProduce, parseId, parseUpdate } from '../util/parsers'

import type { Debugger } from 'debug'
import type { Produce } from '../util/types'

export default class ProduceRouter {
  router: Router
  path: string
  logger: Debugger

  constructor(logger: Debugger, path: string = '/api/v1/produce') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.init()
  }

  init(): void {
    this.router.get('/', this.getAll)
    this.router.get('/:id', this.getById)
    this.router.post('/', this.postOne)
    this.router.put('/:id', this.updateOneById)
    this.router.delete('/:id', this.removeById)
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

  postOne(req: $Request, res: $Response): void {
    if (parseProduce(req.body)) {
      const newProduce = req.body
      newProduce.id = genProduceId(newProduce, inventory)
      inventory.push(newProduce)
      res.status(200).json({
        status: 200,
        message: 'Success',
        item: newProduce
      })
      saveInventory(inventory)
      .then(writePath => {
        this.logger(`Inventory updated. Written to:\n\t` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
      })
      .catch(err => {
        this.logger('Error writing to inventory file.')
        this.logger(err.stack)
      })
    } else {
      res.status(400).json({
        status: 400,
        message: 'Bad Request. Make sure that you submit an item with a ' +
          'name, quantity and price.'
      })
      this.logger('Malformed POST to /produce')
    }
  }

  updateOneById(req: $Request, res: $Response): void {
    const searchId: number | boolean = parseId(req.params)
    const payload: any = parseUpdate(req.body)
    let toUpdate: Produce = inventory.find(item => item.id === searchId)
    if (toUpdate && payload) {
      Object.keys(payload).forEach(key => {
        if (key === 'quantity' || key === 'price') {
          toUpdate[key] = Number(payload[key])
        } else {
          toUpdate[key] = payload[key]
        }
      })
      res.json({
        status: res.status,
        message: 'Success',
        item: toUpdate,
      })
      saveInventory(inventory)
      .then(writePath =>
        this.logger(`Item updated. Inventory written to:\n\t` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`))
      .catch(err => {
        this.logger('Error writing to inventory file.')
        this.logger(err.stack)
      })
    } else {
      res.status(400).json({
        status: res.status,
        message: 'Update failed. Make sure the item ID and submitted fields ' +
          'are correct.'
      })
    }
  }

  removeById(req: $Request, res: $Response): void {
    const searchId: number | boolean = parseId(req.params)
    let toDel: number = inventory.findIndex(item => item.id === searchId)
    if (toDel !== -1) {
      let deleted = inventory.splice(toDel, 1)[0]
      res.json({
        status: 200,
        message: 'Success',
        deleted: deleted,
      })
      saveInventory(inventory)
      .then(writePath => {
        this.logger(`Item deleted. Inventory written to:\n\t` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
      })
      .catch(err => {
        this.logger('Error writing to inventory file.')
        this.logger(err.stack)
      })
    } else {
      res.status(400).json({
        status: 400,
        message: 'No item found with given ID'
      });
    }
  }
}
