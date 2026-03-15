import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../middleware/error.middleware'
import { z } from 'zod'

const registerSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

const generateTokens = (payload: object) => ({
  accessToken:  jwt.sign(payload, process.env.JWT_SECRET!,         { expiresIn: '15m' }),
  refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d'  }),
})

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = registerSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(password, 12)

  // TODO: Save to PostgreSQL
  const user = { id: 'demo-id', email, role: 'learner' }
  const tokens = generateTokens(user)

  res.status(201).json({ success: true, user, ...tokens })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body)

  // TODO: Fetch from PostgreSQL and verify password
  const mockHash = await bcrypt.hash('password123', 12)
  const isValid  = await bcrypt.compare(password, mockHash)

  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })

  const user   = { id: 'demo-id', email, role: 'learner' }
  const tokens = generateTokens(user)

  res.json({ success: true, user, ...tokens })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' })

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
  const tokens  = generateTokens({ id: decoded.id, email: decoded.email, role: decoded.role })

  res.json({ success: true, ...tokens })
})
