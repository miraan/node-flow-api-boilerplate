// @flow

import path from 'path'
import fs from 'fs'
import _ from 'lodash'

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

export function genId(items: Array<any>): string {
  const ids: Array<number> = _.map(items, item => item.id)
  if (ids.length < 1) {
    return '1'
  }
  return (_.max(ids) + 1).toString()
}
