import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js'
import bungieAuthRouter from './routes/bungie-auth.routes.js'
import apiRouter from './routes/index.js'

export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ credentials: true, origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '100kb' }))
app.use('/api/v1', apiRouter)
app.use('/auth/bungie', bungieAuthRouter)
app.use(notFoundHandler)
app.use(errorHandler)
