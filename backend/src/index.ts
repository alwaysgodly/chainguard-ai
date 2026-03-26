import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { rateLimit } from 'express-rate-limit'

// Load env BEFORE any config imports
dotenv.config()

// DB connection (runs connection test on import)
import './config/db'

import authRoutes      from './routes/auth.routes'
import educationRoutes from './routes/education.routes'
import analyticsRoutes from './routes/analytics.routes'
import nftRoutes       from './routes/nft.routes'
import chatRoutes      from './routes/chat.routes'
import { errorHandler } from './middleware/error.middleware'
import { logger }       from './config/logger'

const app  = express()
const http = createServer(app)

// ── Middleware ─────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: { error: 'Too many requests, slow down!' },
}))

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/nft',       nftRoutes)
app.use('/api/chat',      chatRoutes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── Error Handler ──────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000
http.listen(PORT, () => {
  logger.info(`⚡ ChainGuard API running on http://localhost:${PORT}`)
})
