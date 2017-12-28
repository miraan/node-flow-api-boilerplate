// @flow

import passport from 'passport'

import type { NextFunction } from 'express'

export default (req: $Request, res: $Response, next: NextFunction) => {
  passport.authenticate('bearer', { session: false }, (error, user, info) => {
    if (error) {
      return next(error)
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        errorMessage: 'Invalid token.'
      })
    }
    req.user = user
    return next()
  })(req, res, next)
}
