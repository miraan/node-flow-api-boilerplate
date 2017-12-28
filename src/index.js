// @flow

'use strict'

import * as http from 'http'
import debug from 'debug'
import Api from './Api'

import type { Debugger } from 'debug'

declare interface ErrnoError extends Error {
  errno?: number,
  code?: string,
  path?: string,
  syscall?: string,
}

const PROJECT_NAME: string = 'node-flow-api'
const logger: Debugger = debug(`${PROJECT_NAME}:`)
const app: Api = new Api(logger)
const DEFAULT_PORT: number = 3000
const port: string | number = normalizePort(process.env.PORT)
const server: Server = http.createServer(app.express)

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function normalizePort(val: any): number | string {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val
  if ((port && isNaN(port)) || (port >= 0)) {
    return port
  }
  return DEFAULT_PORT
}

function onError(error: ErrnoError): void {
  if (error.syscall !== 'listen') {
    throw error
  }
  let bind: string = (typeof port === 'string')
    ? `Pipe ${port}` : `Port ${port.toString()}`

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening(): void {
  let addr: net$Socket$address = server.address()
  let bind: string = (typeof addr === 'string')
    ? `Pipe ${addr}` : `Port ${addr.port}`
  logger(`Listening on ${bind}`)
}
