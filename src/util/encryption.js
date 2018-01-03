// @flow

import crypto from 'crypto'

const algorithm = 'aes-256-cbc'
const key = 'secretkey123'

export const encrypt = (text: string) => {
  const cipher = crypto.createCipher(algorithm, key)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export const decrypt = (text: string) => {
  const decipher = crypto.createDecipher(algorithm, key)
  let decrypted = decipher.update(text, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
