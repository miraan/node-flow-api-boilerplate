// @flow

import mongoose, { Schema } from 'mongoose'

import type { User } from '../util/types'

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  facebookId: { type: String, index: true },
  facebookAccessToken: String,
  email: String,
  level: Number,
})

userSchema.methods.toUserType = function() {
  const user: User = {
    id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    facebookId: this.facebookId,
    facebookAccessToken: this.facebookAccessToken,
    email: this.email,
    level: this.level,
  }
  return user
}

const UserModel = mongoose.model('User', userSchema)

export default UserModel
