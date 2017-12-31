// @flow

type ToOptionalType = <V>(V) => ?V

export type User = {
  id: string,
  firstName: string,
  lastName: string,
  facebookId: string,
  facebookAccessToken: string,
  email: string,
  level: number,
}

export type CreateUserPayload = $Diff<User, {
  id: string,
}>

export type UpdateUserPayload = {
  ...$ObjMap<CreateUserPayload, ToOptionalType>,
}

export type FacebookProfile = {
  facebookId: string,
  firstName: string,
  lastName: string,
  email: string,
}

export type Trip = {
  id: string,
  userId: string,
  destination: string,
  startDate: string,
  endDate: string,
  comment: string,
}

export type CreateTripPayload = $Diff<Trip, {
  id: string,
  userId: string,
}>

export type UpdateTripPayload = {
  ...$ObjMap<CreateTripPayload, ToOptionalType>,
}

export type ServerConfiguration = {
  defaultPort: number,
  loggerPrefix: string,
  tokenExpireTimeSeconds: number,
  redisServerHost: string,
  redisServerPort: number,
  facebookClientAppId: string,
  facebookClientAppSecret: string,
}
