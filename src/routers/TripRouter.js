// @flow

import { Router } from 'express'
import path from 'path'
import _ from 'lodash'
import DataStore from '../stores/DataStore'
import trips from '../../data/trips'
import passportBearerAuthenticated from '../util/passportBearerAuthenticated'
import { parseCreateTripPayload, parseUpdateTripPayload } from '../util/parsers'
import { saveItems, genId } from '../util/save'

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
    this.router.post('/', passportBearerAuthenticated, this.postOne)
    this.router.put('/:id', passportBearerAuthenticated, this.updateById)
    this.router.delete('/:id', passportBearerAuthenticated, this.removeById)
  }

  getOwn = (req: $Request, res: $Response) => {
    const user: User = req.user
    const ownTrips: Array<Trip> = _.filter(trips, trip => trip.userId === user.id)
    res.status(200).json({
      success: true,
      content: {
        trips: ownTrips
      }
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
    res.status(200).json({
      success: true,
      content: {
        trips: trips
      }
    })
  }

  getById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    const trip: Trip = trips.find(trip => trip.id === id)
    if (!trip) {
      res.status(400).json({
        success: false,
        errorMessage: 'No trip with that ID exists.'
      })
      return
    }
    if (user.id !== trip.userId && (!user.level || user.level < 3)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    res.status(200).json({
      success: true,
      content: {
        trip: trip
      }
    })
  }

  postOne = (req: $Request, res: $Response) => {
    const user: User = req.user
    const payload: ?CreateTripPayload = parseCreateTripPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid create trip payload.'
      })
      return
    }
    const newTrip: Trip = {
      ...payload,
      id: genId(trips),
      userId: user.id,
    }
    trips.push(newTrip)
    res.status(200).json({
      success: true,
      content: {
        trip: newTrip
      }
    })
    this.saveTripsFile()
  }

  updateById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    const trip: Trip = trips.find(trip => trip.id === id)
    if (!trip) {
      res.status(400).json({
        success: false,
        errorMessage: 'No trip with that ID exists.'
      })
      return
    }
    if (user.id !== trip.userId && (!user.level || user.level < 3)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const payload: ?UpdateTripPayload = parseUpdateTripPayload(req.body)
    if (!payload) {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid update trip payload.'
      })
      return
    }
    // $FlowFixMe
    Object.assign(trip, payload)
    res.status(200).json({
      success: true,
      content: {
        trip: trip
      }
    })
    this.saveTripsFile()
  }

  removeById = (req: $Request, res: $Response) => {
    const user: User = req.user
    const id = parseInt(req.params.id, 10)
    const tripIndex: number = trips.findIndex(trip => trip.id === id)
    if (tripIndex === -1) {
      res.status(400).json({
        success: false,
        errorMessage: 'No trip with that ID exists.'
      })
      return
    }
    const trip: Trip = trips[tripIndex]
    if (user.id !== trip.userId && (!user.level || user.level < 3)) {
      res.status(401).json({
        success: false,
        errorMessage: 'Unauthorized.'
      })
      return
    }
    const deletedTrip = trips.splice(tripIndex, 1)[0]
    res.status(200).json({
      success: true,
      content: {
        trip: deletedTrip
      }
    })
    this.saveTripsFile()
  }

  saveTripsFile = () => {
    saveItems(trips, 'trips.json')
    .then(writePath => {
      this.logger(`Trips updated. Written to:\n\t` +
        `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
    })
    .catch(err => {
      this.logger('Error writing to trips file.')
      this.logger(err.stack)
    })
  }
}
