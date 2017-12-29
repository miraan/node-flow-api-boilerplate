// @flow

type ToOptionalType = <V>(V) => ?V

export type Produce = {
  id: number,
  name: string,
  quantity: number,
  price: number,
}

export type User = {
  id: number,
  firstName: string,
  lastName: string,
  facebookId: string,
  facebookAccessToken: string,
  email: string,
  level: number,
}

export type CreateUserPayload = $Diff<User, {
  id: number,
}>

export type UpdateUserPayload = {
  ...$ObjMap<CreateUserPayload, ToOptionalType>,
}

export type Trip = {
  id: number,
  userId: number,
  destination: string,
  startDate: string,
  endDate: string,
  comment: string,
}

export type CreateTripPayload = $Diff<Trip, {
  id: number,
  userId: number,
}>

export type UpdateTripPayload = {
  ...$ObjMap<CreateTripPayload, ToOptionalType>,
}
