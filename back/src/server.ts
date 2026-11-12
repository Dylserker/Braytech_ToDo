import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { app } from './app.js'
import { env } from './config/env.js'

const server = env.HTTPS_ENABLED
  ? createHttpsServer({
    key: readFileSync(resolve(process.cwd(), env.HTTPS_KEY_PATH)),
    cert: readFileSync(resolve(process.cwd(), env.HTTPS_CERT_PATH)),
  }, app)
  : createHttpServer(app)

server.listen(env.PORT, () => {
  const protocol = env.HTTPS_ENABLED ? 'https' : 'http'
  console.log(`Braytech ToDo API listening on ${protocol}://localhost:${env.PORT}`)
})

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`)
  server.close((error) => {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
