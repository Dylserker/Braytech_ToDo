import { Router } from 'express'
import bungieAuthRouter from './bungie-auth.routes.js'
import healthRouter from './health.routes.js'

const apiRouter = Router()

apiRouter.get('/', (_request, response) => {
  response.json({
    name: 'Braytech ToDo API',
    version: 'v1',
    endpoints: {
      health: '/api/v1/health',
    },
  })
})

apiRouter.use('/health', healthRouter)
apiRouter.use('/auth/bungie', bungieAuthRouter)

export default apiRouter
