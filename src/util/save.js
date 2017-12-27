// @flow

import path from 'path'
import fs from 'fs'

import type { Produce } from './types'

export default function saveInventory(inventory: Array<Produce>): Promise<string> {
  let outpath = path.join(__dirname, '..', '..', 'data', 'produce.json')
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== 'test') {
      fs.writeFile(outpath, JSON.stringify(inventory, null, '\t'), err =>
        (err) ? reject(err) : resolve(outpath)
      )
    }
  })
}

export function genId(prod: Produce, inv: Array<Produce>): number {
  if (typeof inv[0].id === 'undefined') {
    return 1
  }
  let maxId: number = inv[0].id
  inv.slice(1).forEach(item => {
    if (item.id && item.id > maxId) maxId = item.id
  })
  return maxId + 1
}
