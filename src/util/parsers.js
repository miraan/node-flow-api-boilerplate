// @flow

import type { CreateUserPayload, UpdateUserPayload, CreateTripPayload,
  UpdateTripPayload } from './types'
import _ from 'lodash'

export function parseCreateUserPayload(input: any): ?CreateUserPayload {
  const requiredKeys: CreateUserPayload = {
    firstName: '',
    lastName: '',
    facebookId: '',
    facebookAccessToken: '',
    level: 0,
    email: ''
  }
  if (_.difference(_.keys(requiredKeys), _.keys(input)).length > 0) {
    return null
  }
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    facebookId: input.facebookId,
    facebookAccessToken: input.facebookAccessToken,
    level: input.level,
    email: input.email,
  }
}

export function parseUpdateUserPayload(input: any): ?UpdateUserPayload {
  let payload: UpdateUserPayload = {}
  const possibleKeys: CreateUserPayload = {
    firstName: '',
    lastName: '',
    facebookId: '',
    facebookAccessToken: '',
    level: 0,
    email: ''
  }
  _.keys(possibleKeys).forEach((key, index) => {
    if (input[key]) {
      payload[key] = input[key]
    }
  })
  if (_.keys(payload).length < 1) {
    return null
  }
  return payload
}

export function parseCreateTripPayload(input: any): ?CreateTripPayload {
  const requiredKeys: CreateTripPayload = {
    destination: '',
    startDate: '',
    endDate: '',
    comment: '',
  }
  if (_.difference(_.keys(requiredKeys), _.keys(input)).length > 0) {
    return null
  }
  return {
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    comment: input.comment,
  }
}

export function parseUpdateTripPayload(input: any): ?UpdateTripPayload {
  let payload: UpdateTripPayload = {}
  const possibleKeys: CreateTripPayload = {
    destination: '',
    startDate: '',
    endDate: '',
    comment: '',
  }
  _.keys(possibleKeys).forEach((key, index) => {
    if (input[key]) {
      payload[key] = input[key]
    }
  })
  if (_.keys(payload).length < 1) {
    return null
  }
  return payload
}
