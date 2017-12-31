// @flow

import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  facebookId: { type: [String], index: true },
  facebookAccessToken: String,
  email: String,
  level: Number,
})

const UserModel = mongoose.model('User', userSchema)

export default UserModel
