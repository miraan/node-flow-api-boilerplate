// @flow

'use strict'

import * as http from 'http'
import debug from 'debug'
import ServerConfigurationObject from './configuration'
import TokenStore from './util/TokenStore'
import Api from './Api'

import type { Debugger } from 'debug'

declare interface ErrnoError extends Error {
  errno?: number,
  code?: string,
  path?: string,
  syscall?: string,
}

const logger: Debugger = debug(ServerConfigurationObject.loggerPrefix + ':')
const tokenStore: TokenStore = new TokenStore(logger)
const app: Api = new Api(logger, tokenStore)
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
  return ServerConfigurationObject.defaultPort
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
