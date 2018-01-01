// @flow

import mongoose from 'mongoose'
mongoose.Promise = Promise
import path from 'path'
import _ from 'lodash'
import ServerConfigurationObject from '../configuration'
import UserModel from '../mongoose/UserModel'
import TripModel from '../mongoose/TripModel'

import type { Debugger } from 'debug'
import type { User, CreateUserPayload, UpdateUserPayload, Trip,
  CreateTripPayload, UpdateTripPayload } from '../util/types'

export default class DataStore {
  logger: Debugger

  constructor(logger: Debugger) {
    this.logger = logger
    mongoose.connect(`mongodb://${ServerConfigurationObject.mongoDbHost}:` +
      `${ServerConfigurationObject.mongoDbPort}/` +
      `${ServerConfigurationObject.mongoDbDatabaseName}` +
      `?authSource=${ServerConfigurationObject.mongoDbAuthenticationDatabase}`, {
      user: ServerConfigurationObject.mongoDbUserName,
      pass: ServerConfigurationObject.mongoDbPassword,
    })
    const db = mongoose.connection
    db.on('error', error => this.logger('Mongoose Connection Error: ' + error))
    db.once('open', () => this.logger('Mongoose Connected Successfully.'))
  }

  getUsers: () => Promise<Array<User>> = () => {
    return new Promise((resolve, reject) => {
      UserModel.find().then(userDocuments => {
        const users = _.map(userDocuments, userDocument => userDocument.toUserType())
        resolve(users)
      })
      .catch(error => {
        reject('DataStore getUsers error: UserModel find error: ' + error)
      })
    })
  }

  getUserById: string => Promise<?User> = (userId: string) => {
    return new Promise((resolve, reject) => {
      UserModel.findById(userId).then(userDocument => {
        if (!userDocument) {
          resolve(null)
          return Promise.reject(null)
        }
        resolve(userDocument.toUserType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore getUserById error: UserModel findById error: ' + error)
      })
    })
  }

  getUserByFacebookId: string => Promise<?User> = (facebookId: string) => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ 'facebookId': facebookId }).then(userDocument => {
        if (!userDocument) {
          resolve(null)
          return Promise.reject(null)
        }
        resolve(userDocument.toUserType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore getUserByFacebookId error: UserModel findOne error: ' + error)
      })
    })
  }

  createUser: CreateUserPayload => Promise<User> = (payload: CreateUserPayload) => {
    return new Promise((resolve, reject) => {
      var newUserDocument = new UserModel(payload)
      newUserDocument.save().then(userDocument => {
        if (!userDocument) {
          reject('DataStore createUser error: UserModel save error: No document returned')
          return Promise.reject(null)
        }
        resolve(userDocument.toUserType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore createUser error: UserModel save error: ' + error)
      })
    })
  }

  updateUser: (string, UpdateUserPayload) => Promise<User> =
  (userId: string, payload: UpdateUserPayload) => {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(userId, { $set: payload }, { new: true })
      .then(userDocument => {
        if (!userDocument) {
          reject('DataStore updateUser error: UserModel findByIdAndUpdate ' +
            'error: Returned null document')
          return Promise.reject(null)
        }
        resolve(userDocument.toUserType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore updateUser error: ' + error)
      })
    })
  }

  deleteUser: string => Promise<User> = (userId: string) => {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndRemove(userId).then(userDocument => {
        if (!userDocument) {
          reject('DataStore deleteUser error: UserModel findByIdAndRemove ' +
            'error: Returned null document')
          return Promise.reject(null)
        }
        resolve(userDocument.toUserType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore deleteUser error: ' + error)
      })
    })
  }

  getTrips: () => Promise<Array<Trip>> = () => {
    return new Promise((resolve, reject) => {
      TripModel.find().then(tripDocuments => {
        const trips = _.map(tripDocuments, tripDocument => tripDocument.toTripType())
        resolve(trips)
      })
      .catch(error => {
        reject('DataStore getTrips error: TripModel find error: ' + error)
      })
    })
  }

  getTripsByUserId: string => Promise<Array<Trip>> = (userId: string) => {
    return new Promise((resolve, reject) => {
      TripModel.find({ user: userId }).then(tripDocuments => {
        const trips = _.map(tripDocuments, tripDocument => tripDocument.toTripType())
        resolve(trips)
      })
      .catch(error => {
        reject('DataStore getTripsByUserId error: TripModel find error: ' + error)
      })
    })
  }

  getTripById: string => Promise<?Trip> = (tripId: string) => {
    return new Promise((resolve, reject) => {
      TripModel.findById(tripId).then(tripDocument => {
        if (!tripDocument) {
          resolve(null)
          return Promise.reject(null)
        }
        resolve(tripDocument.toTripType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore getTripById error: TripModel findById error: ' + error)
      })
    })
  }

  createTrip: (string, CreateTripPayload) => Promise<Trip> =
  (userId: string, payload: CreateTripPayload) => {
    return new Promise((resolve, reject) => {
      var newTripDocument = new TripModel({
        ...payload,
        user: userId,
      })
      newTripDocument.save().then(tripDocument => {
        if (!tripDocument) {
          reject('DataStore createTrip error: TripModel save error: No document returned')
          return Promise.reject(null)
        }
        resolve(tripDocument.toTripType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore createTrip error: ' + error)
      })
    })
  }

  updateTrip: (string, UpdateTripPayload) => Promise<Trip> =
  (tripId: string, payload: UpdateTripPayload) => {
    return new Promise((resolve, reject) => {
      TripModel.findByIdAndUpdate(tripId, { $set: payload }, { new: true })
      .then(tripDocument => {
        if (!tripDocument) {
          reject('DataStore updateTrip error: TripModel findByIdAndUpdate ' +
            'error: No document returned')
          return Promise.reject(null)
        }
        resolve(tripDocument.toTripType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore updateTrip error: ' + error)
      })
    })
  }

  deleteTrip: string => Promise<Trip> = (tripId: string) => {
    return new Promise((resolve, reject) => {
      TripModel.findByIdAndRemove(tripId).then(tripDocument => {
        if (!tripDocument) {
          reject('DataStore deleteTrip error: TripModel findByIdAndRemove ' +
            'error: No document returned')
          return Promise.reject(null)
        }
        resolve(tripDocument.toTripType())
      })
      .catch(error => {
        if (!error) {
          return
        }
        reject('DataStore deleteTrip error: ' + error)
      })
    })
  }

  deleteAllUsers: () => Promise<*> = () => {
    return UserModel.deleteMany({})
  }

  deleteAllTrips: () => Promise<*> = () => {
    return TripModel.deleteMany({})
  }

  deleteAllData: () => Promise<*> = () => {
    return Promise.all([
      this.deleteAllUsers(),
      this.deleteAllTrips(),
    ])
  }
}
