import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  getModules,
  getModuleById,
  getLessons,
  getQuiz,
  submitQuiz,
  saveProgress,
  getProgress,
} from '../controllers/education.controller'

const router = Router()

// ── Public endpoints ──────────────────────────────────────────────
router.get('/modules',              getModules)          // GET  /api/education/modules
router.get('/modules/:id',         getModuleById)        // GET  /api/education/modules/:id
router.get('/modules/:id/lessons', getLessons)            // GET  /api/education/modules/:id/lessons
router.get('/modules/:id/quiz',    getQuiz)               // GET  /api/education/modules/:id/quiz

// ── Protected endpoints ───────────────────────────────────────────
router.post('/modules/:id/quiz/submit', protect, submitQuiz)  // POST /api/education/modules/:id/quiz/submit
router.post('/progress',                protect, saveProgress) // POST /api/education/progress
router.get ('/progress',                protect, getProgress)  // GET  /api/education/progress

export default router
