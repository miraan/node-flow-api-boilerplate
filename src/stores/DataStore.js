// @flow

import users from '../../data/users'
import trips from '../../data/trips'
import path from 'path'
import _ from 'lodash'
import { saveItems, genId } from '../util/save'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload, UpdateUserPayload, Trip,
  CreateTripPayload, UpdateTripPayload } from '../util/types'

export default class DataStore {
  logger: Debugger

  constructor(logger: Debugger) {
    this.logger = logger
  }

  getUsers: () => Promise<Array<User>> = () => {
    return new Promise((resolve, reject) => {
      resolve(users)
    })
  }

  getUserById: number => Promise<?User> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.id === userId)
      if (!user) {
        resolve(null)
        return
      }
      resolve(user)
    })
  }

  getUserByFacebookId: string => Promise<?User> = (facebookId: string) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.facebookId === facebookId)
      if (!user) {
        resolve(null)
        return
      }
      resolve(user)
    })
  }

  createUser: CreateUserPayload => Promise<User> = (payload: CreateUserPayload) => {
    return new Promise((resolve, reject) => {
      const user: User = {
        ...payload,
        id: genId(users),
      }
      users.push(user)
      this._saveUsers().then(writePath => {
        resolve(user)
      })
      .catch(error => {
        reject('DataStore createUser error: ' + error)
      })
    })
  }

  updateUser: (number, UpdateUserPayload) => Promise<User> =
  (userId: number, payload: UpdateUserPayload) => {
    return new Promise((resolve, reject) => {
      const user: ?User = users.find(user => user.id === userId)
      if (!user) {
        reject('DataStore updateUser error: No user found with given userId.')
        return
      }
      // $FlowFixMe
      Object.assign(user, payload)
      this._saveUsers().then(writePath => {
        resolve(user)
      })
      .catch(error => {
        reject('DataStore updateUser error: ' + error)
      })
    })
  }

  deleteUser: number => Promise<User> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const index: number = users.findIndex(user => user.id === userId)
      if (index === -1) {
        reject('DataStore deleteUser error: No user found with given userId.')
        return
      }
      const deletedRecord = users.splice(index, 1)[0]
      this._saveUsers().then(writePath => {
        resolve(deletedRecord)
      })
      .catch(error => {
        reject('DataStore deleteUser error: ' + error)
      })
    })
  }

  getTrips: () => Promise<Array<Trip>> = () => {
    return new Promise((resolve, reject) => {
      resolve(trips)
    })
  }

  getTripsByUserId: number => Promise<Array<Trip>> = (userId: number) => {
    return new Promise((resolve, reject) => {
      const userTrips: Array<Trip> = _.filter(trips, trip => trip.userId === userId)
      resolve(userTrips)
    })
  }

  getTripById: number => Promise<?Trip> = (tripId: number) => {
    return new Promise((resolve, reject) => {
      const trip: ?Trip = trips.find(trip => trip.id === tripId)
      if (!trip) {
        resolve(null)
        return
      }
      resolve(trip)
    })
  }

  createTrip: CreateTripPayload => Promise<Trip> = (payload: CreateTripPayload) => {
    return new Promise((resolve, reject) => {
      const trip: Trip = {
        ...payload,
        id: genId(trips),
      }
      trips.push(trip)
      this._saveTrips().then(writePath => {
        resolve(trip)
      })
      .catch(error => {
        reject('DataStore createTrip error: ' + error)
      })
    })
  }

  updateTrip: (number, UpdateTripPayload) => Promise<Trip> =
  (tripId: number, payload: UpdateTripPayload) => {
    return new Promise((resolve, reject) => {
      const trip: ?Trip = trips.find(trip => trip.id === tripId)
      if (!trip) {
        reject('DataStore updateTrip error: No trip found with given tripId.')
        return
      }
      // $FlowFixMe
      Object.assign(trip, payload)
      this._saveTrips().then(writePath => {
        resolve(trip)
      })
      .catch(error => {
        reject('DataStore updateTrip error: ' + error)
      })
    })
  }

  deleteTrip: number => Promise<Trip> = (tripId: number) => {
    return new Promise((resolve, reject) => {
      const index: number = trips.findIndex(trip => trip.id === tripId)
      if (index === -1) {
        reject('DataStore deleteTrip error: No trip found with given tripId.')
        return
      }
      const deletedRecord = trips.splice(index, 1)[0]
      this._saveTrips().then(writePath => {
        resolve(deletedRecord)
      })
      .catch(error => {
        reject('DataStore deleteTrip error: ' + error)
      })
    })
  }

  _saveUsers: () => Promise<string> = () => {
    return new Promise((resolve, reject) => {
      saveItems(users, 'users.json').then(writePath => {
        this.logger(`Users updated. Written to: ` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
        resolve(writePath)
      })
      .catch(error => {
        reject('DataStore _saveUsers error: ' + error)
      })
    })
  }

  _saveTrips: () => Promise<string> = () => {
    return new Promise((resolve, reject) => {
      saveItems(trips, 'trips.json').then(writePath => {
        this.logger(`Trips updated. Written to: ` +
          `${path.relative(path.join(__dirname, '..', '..'), writePath)}`)
        resolve(writePath)
      })
      .catch(error => {
        reject('DataStore _saveTrips error: ' + error)
      })
    })
  }
}
