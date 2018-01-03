// @flow

import type { NextFunction } from 'express'

export default (req: $Request, res: $Response, next: NextFunction) => {
  res.header(
    'Access-Control-Allow-Origin',
    '*'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
}
