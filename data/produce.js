// @flow

type Produce = {
  id: number,
  name: string,
  quantity: number,
  price: number,
}

export const inventory: Array<Produce> = [
  {
    id: 1,
    name: 'Carrots',
    quantity: 3,
    price: 0.79,
  },
  {
    id: 2,
    name: 'Apples',
    quantity: 2,
    price: 0.59,
  },
  {
    id: 3,
    name: 'Pears',
    quantity: 5,
    price: 0.99,
  },
]
