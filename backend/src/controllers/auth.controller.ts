import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { validationResult } from 'express-validator'
import pool from '../config/db'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../config/jwt'
import { AuthRequest } from '../middleware/auth.middleware'
import logger from '../config/logger'

// ── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const { name, email, password, role = 'learner' } = req.body

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Email already registered' })
      return
    }

    // Hash password
    const salt          = await bcrypt.genSalt(12)
    const password_hash = await bcrypt.hash(password, salt)

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase(), password_hash, role]
    )
    const user = result.rows[0]

    // Generate tokens
    const payload       = { userId: user.id, email: user.email, role: user.role }
    const accessToken   = generateAccessToken(payload)
    const refreshToken  = generateRefreshToken(payload)

    // Store hashed refresh token in DB
    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [hashedRefresh, user.id]
    )

    logger.info(`New user registered: ${user.email}`)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() })
      return
    }

    const { email, password } = req.body

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    const user = result.rows[0]

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    // Generate tokens
    const payload      = { userId: user.id, email: user.email, role: user.role }
    const accessToken  = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [hashedRefresh, user.id]
    )

    logger.info(`User logged in: ${user.email}`)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' })
      return
    }

    // Verify token signature
    const decoded = verifyRefreshToken(refreshToken)

    // Check token matches stored hash
    const result = await pool.query(
      'SELECT id, email, role, refresh_token FROM users WHERE id = $1',
      [decoded.userId]
    )
    const user = result.rows[0]

    if (!user || !user.refresh_token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' })
      return
    }

    const isValid = await bcrypt.compare(refreshToken, user.refresh_token)
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' })
      return
    }

    // Issue new token pair (token rotation)
    const payload         = { userId: user.id, email: user.email, role: user.role }
    const newAccessToken  = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10)
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [hashedRefresh, user.id]
    )

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Invalidate refresh token in DB
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [req.user?.userId]
    )

    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, wallet_address, created_at FROM users WHERE id = $1',
      [req.user?.userId]
    )
    const user = result.rows[0]

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.status(200).json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}