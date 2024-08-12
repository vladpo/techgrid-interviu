import { Server, Socket } from 'socket.io'
import logger from '../logging'
import http from 'http'
import express from 'express'
import type { CorsOptions, CorsOptionsDelegate } from 'cors'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketResponse,
} from 'demo-common'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

const SERVER_PORT = 8080
export const expressApp = express()
export const corsOptions: CorsOptions | CorsOptionsDelegate = {
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  methods: 'GET,PUT,POST,PATCH,DELETE,OPTIONS',
  allowedHeaders:
    'Authorization, Access-Control-Allow-Headers, Cache-Control, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
  credentials: true,
  maxAge: 30 * 60 * 60 * 1000,
  optionsSuccessStatus: 200,
}

const httpServer = http.createServer(expressApp)
httpServer.listen(SERVER_PORT, 'localhost', () => {
  logger.info(`[server] Server running on port ${SERVER_PORT}`)
})

export type IO = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketResponse
>
export type WSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketResponse
>

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketResponse
>(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
io.on('connection', (socket: WSocket) => {
  logger.info(`[server]: Connection created ${socket.id}`)
})
