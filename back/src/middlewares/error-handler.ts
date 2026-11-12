import type { ErrorRequestHandler, RequestHandler } from 'express'

export class HttpError extends Error {
  public readonly statusCode: number

  constructor(
    statusCode: number,
    message: string,
  ) {
    super(message)
    this.statusCode = statusCode
    this.name = 'HttpError'
  }
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, `Route introuvable : ${request.method} ${request.originalUrl}`))
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500
  const message = error instanceof Error ? error.message : 'Erreur interne du serveur'

  if (statusCode >= 500) console.error(error)

  response.status(statusCode).json({
    error: {
      statusCode,
      message: statusCode >= 500 ? 'Erreur interne du serveur' : message,
    },
  })
}
