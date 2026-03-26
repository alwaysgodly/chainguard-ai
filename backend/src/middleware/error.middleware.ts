import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${err.message}\n${err.stack}`)

  const statusCode = (err as any).statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}
