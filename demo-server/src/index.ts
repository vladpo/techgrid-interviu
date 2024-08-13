import express from 'express'
import { createDbConnect } from './db'
import { userRouter } from './user'
import helmet from 'helmet'
import morgan from 'morgan'
import { authRouter, verifyJwt } from './authentication'
import cors from 'cors'
import nocache from 'nocache'
import cookieParser from 'cookie-parser'
import { corsOptions, expressApp, io } from './websocket'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import emitCurrencyQuotes from './currency'

createDbConnect().then(() => {
  expressApp
    .use(helmet())
    .use(nocache())
    .use(cookieParser())
    .use(express.urlencoded({ extended: false, limit: '1mb' }))
    .use(express.json({ limit: '1mb' }))
    .use(cors(corsOptions))
    .use(
      morgan('myFormat', {
        skip: function (req, res) {
          return res.statusCode < 400
        },
        stream: process.stderr
      })
    )
    .use(
      morgan('myFormat', {
        skip: function (req, res) {
          return res.statusCode >= 400
        },
        stream: process.stdout
      })
    )
    .use('/api', userRouter)
    .use('/auth', authRouter)
  io.engine.use((req: Request, res: Response, next: NextFunction) => {
    if (req.query && typeof req.query.sid === 'string') {
      return verifyJwt(req, res, next)
    } else {
      next()
    }
  })
  emitCurrencyQuotes()
})
