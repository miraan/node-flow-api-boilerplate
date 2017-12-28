// @flow

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

export type FieldsOnlyInExistingObjects = {
  id: number,
}

export type CreateUserPayload = $Diff<User, FieldsOnlyInExistingObjects>

type ToOptionalType = <V>(V) => ?V

export type UpdateUserPayload = {
  ...$ObjMap<CreateUserPayload, ToOptionalType>,
}
