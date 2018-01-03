// @flow

import { Router } from 'express'
import path from 'path'
import _ from 'lodash'
import DataStore from '../stores/DataStore'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'
import { parseCreateTripPayload, parseUpdateTripPayload } from '../util/parsers'

import type { Debugger } from 'debug'
import type { User, Trip, CreateTripPayload, UpdateTripPayload } from '../util/types'

export default class TripRouter {
  router: Router
  path: string
  logger: Debugger
  dataStore: DataStore

  constructor(logger: Debugger, dataStore: DataStore, path: string = '/api/v1/trip') {
    this.router = Router()
    this.path = path
    this.logger = logger
    this.dataStore = dataStore
    this.init()
  }

  init = () => {
    this.router.get('/me', passportBearerAuthenticated, this.getOwn)
    this.router.get('/', passportBearerAuthenticated, this.getAll)
    this.router.get('/:id', passportBearerAuthenticated, this.getById)
    this.router.post('/', passportBearerAuthenticated, this.create)
    this.router.post('/me', passportBearerAuthenticated, this.createOwn)
    this.router.put('/:id', passportBearerAuthenticated, this.updateById)
    this.router.delete('/:id', passportBearerAuthenticated, this.removeById)
  }

  getOwn = (req: $Request, res: $Response) => {
    const user: User = req.user
    this.dataStore.getTripsByUserId(user.id).then(ownTrips => {
      res.status(200).json({
        success: true,
        content: {
          trips: ownTrips
        }
      })
    })
    .catch(error => {
      this.logger('TripRouter getOwn Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error getting trips.'
      })
    })
  }

  getAll = (req: $Request, res: $Response) => {
    const user: User = req.user
    if (!user.level || user.level < 3) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    this.dataStore.getTrips().then(trips => {
      res.status(200).json({
        success: true,
        content: {
          trips: trips
        }
      })
    })
    .catch(error => {
      this.logger('TripRouter getAll Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error getting trips.'
      })
    })
  }

  getById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    this.dataStore.getTripById(id).then(trip => {
      if (!trip) {
        res.status(400).json({
          success: false,
          errorMessage: 'No trip with that ID exists.'
        })
        return Promise.reject(null)
      }
      if (user.id !== trip.userId && (!user.level || user.level < 3)) {
        res.status(401).json({
          success: false,
          errorMessage: 'Unauthorized.'
        })
        return Promise.reject(null)
      }
      res.status(200).json({
        success: true,
        content: {
          trip: trip
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('TripRouter getById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error getting trip.'
      })
    })
  }

  createOwn = (req: $Request, res: $Response) => {
    const user: User = req.user
    const payload: ?CreateTripPayload = parseCreateTripPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid create trip payload.'
      })
      return
    }
    this.dataStore.createTrip(user.id, payload).then(trip => {
      res.status(200).json({
        success: true,
        content: {
          trip: trip
        }
      })
    })
    .catch(error => {
      this.logger('TripRouter createOwn Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error creating trip.'
      })
    })
  }

  create = (req: $Request, res: $Response) => {
    const user: User = req.user
    const userId = req.body.userId
    if (!userId) {
      res.status(400).json({
        success: false,
        errorMessage: 'userId for new trip required for this endpoint.'
      })
      return
    }
    if (userId !== req.user.id && (!user.level || user.level < 3)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    delete req.body.userId
    const payload: ?CreateTripPayload = parseCreateTripPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid create trip payload.'
      })
      return
    }
    this.dataStore.createTrip(userId, payload).then(trip => {
      res.status(200).json({
        success: true,
        content: {
          trip: trip
        }
      })
    })
    .catch(error => {
      this.logger('TripRouter create Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error creating trip.'
      })
    })
  }

  updateById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    this.dataStore.getTripById(id).then(trip => {
      if (!trip) {
        res.status(400).json({
          success: false,
          errorMessage: 'No trip with that ID exists.'
        })
        return Promise.reject(null)
      }
      if (user.id !== trip.userId && (!user.level || user.level < 3)) {
        res.status(401).json({
          success: false,
          errorMessage: 'Unauthorized.'
        })
        return Promise.reject(null)
      }
      const payload: ?UpdateTripPayload = parseUpdateTripPayload(req.body)
      if (!payload) {
        res.status(400).json({
          success: false,
          errorMessage: 'Invalid update trip payload.'
        })
        return Promise.reject(null)
      }
      return this.dataStore.updateTrip(trip.id, payload)
    })
    .then(trip => {
      res.status(200).json({
        success: true,
        content: {
          trip: trip
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('TripRouter updateById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error updating trip.'
      })
    })
  }

  removeById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = req.params.id
    this.dataStore.getTripById(id).then(trip => {
      if (!trip) {
        res.status(400).json({
          success: false,
          errorMessage: 'No trip with that ID exists.'
        })
        return Promise.reject(null)
      }
      if (user.id !== trip.userId && (!user.level || user.level < 3)) {
        res.status(401).json({
          success: false,
          errorMessage: 'Unauthorized.'
        })
        return Promise.reject(null)
      }
      return this.dataStore.deleteTrip(trip.id)
    })
    .then(deletedTrip => {
      res.status(200).json({
        success: true,
        content: {
          trip: deletedTrip
        }
      })
    })
    .catch(error => {
      if (!error) {
        return
      }
      this.logger('TripRouter removeById Error: ' + error)
      res.status(500).json({
        success: false,
        errorMessage: 'Error deleting trip.'
      })
    })
  }
}
