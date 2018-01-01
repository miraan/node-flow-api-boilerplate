// @flow

import mongoose, { Schema } from 'mongoose'

import type { Trip } from '../util/types'

const tripSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  destination: String,
  startDate: Date,
  endDate: Date,
  comment: String,
})

tripSchema.methods.toTripType = function() {
  const trip: Trip = {
    id: this._id.toString(),
    userId: this.user.toString(),
    destination: this.destination,
    startDate: this.startDate.toJSON(),
    endDate: this.endDate.toJSON(),
    comment: this.comment,
  }
  return trip
}

const TripModel = mongoose.model('Trip', tripSchema)

export default TripModel
