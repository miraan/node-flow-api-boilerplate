// @flow

import path from 'path'
import fs from 'fs'
import _ from 'lodash'

import type { Produce } from './types'

export function saveInventory(inventory: Array<Produce>): Promise<string> {
  let outpath = path.join(__dirname, '..', '..', 'data', 'produce.json')
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'test') {
      fs.writeFile(outpath, JSON.stringify(inventory, null, '\t'), err =>
        (err) ? reject(err) : resolve(outpath)
      )
    }
  })
}

export function genProduceId(inv: Array<Produce>): number {
  if (typeof inv[0].id === 'undefined') {
    return 1
  }
  let maxId: number = inv[0].id
  inv.slice(1).forEach(item => {
    if (item.id && item.id > maxId) maxId = item.id
  })
  return maxId + 1
}

export function saveItems(items: Array<any>, file: string): Promise<string> {
  let outpath = path.join(__dirname, '..', '..', 'data', file)
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'test') {
      fs.writeFile(outpath, JSON.stringify(items, null, '\t'), err =>
        err
        ? reject('Save items error: ' + (err.description || ''))
        : resolve(outpath)
      )
    }
  })
}

export function genId(items: Array<any>): number {
  const ids: Array<number> = _.map(items, item => item.id)
  if (ids.length < 1) {
    return 1
  }
  return _.max(ids) + 1
}
