import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, refresh, logout, me } from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// ── Validation rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('role')
    .optional()
    .isIn(['learner', 'pro']).withMessage('Role must be learner or pro'),
]

const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

// ── Routes ────────────────────────────────────────────────────────────────────

// Public
router.post('/register', registerRules, register)  // POST /api/auth/register
router.post('/login',    loginRules,    login)      // POST /api/auth/login
router.post('/refresh',                refresh)     // POST /api/auth/refresh

// Protected
router.post('/logout', protect, logout)             // POST /api/auth/logout
router.get ('/me',     protect, me)                 // GET  /api/auth/me

export default router