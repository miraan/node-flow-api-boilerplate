// @flow

import type { CreateUserPayload, UpdateUserPayload, CreateTripPayload,
  UpdateTripPayload } from './types'
import _ from 'lodash'

export function parseProduce(input: any): boolean {
  const requirements = [
    { key: 'name', type: 'string' },
    { key: 'quantity', type: 'number' },
    { key: 'price', type: 'number' }
  ]
  return requirements.every(req =>
    input.hasOwnProperty(req.key) && typeof input[req.key] === req.type
  )
}

export function parseUpdate(input: any): any | null {
  const validKeys = ['name', 'quantity', 'price']
  const trimmed = Object.keys(input).reduce((obj, curr) => {
    if (obj && validKeys.indexOf(curr) !== -1) {
      obj[curr] = input[curr]
      return obj
    }
  }, {})
  return (trimmed && Object.keys(trimmed).length > 0) ? trimmed : null
}

export function parseId(input: any): number | boolean {
  if (input.hasOwnProperty('id'))
    return (typeof input.id === 'string') ? parseInt(input.id, 10) : input.id
  return false
}

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
