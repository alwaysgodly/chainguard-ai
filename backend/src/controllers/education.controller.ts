import { Request, Response, NextFunction } from 'express'
import pool from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import logger from '../config/logger'

// ── GET /api/education/modules ────────────────────────────────────────────────
export const getModules = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, difficulty, lesson_count, estimated_minutes, "order" FROM modules ORDER BY "order" ASC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/education/modules/:id ────────────────────────────────────────────
export const getModuleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const modResult = await pool.query(
      'SELECT * FROM modules WHERE id = $1',
      [id]
    )
    if (modResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Module not found' })
      return
    }

    const lessonsResult = await pool.query(
      'SELECT id, title, content, "order" FROM lessons WHERE module_id = $1 ORDER BY "order" ASC',
      [id]
    )

    res.json({
      success: true,
      data: {
        ...modResult.rows[0],
        lessons: lessonsResult.rows,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/education/modules/:id/lessons ────────────────────────────────────
export const getLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, module_id, title, content, "order" FROM lessons WHERE module_id = $1 ORDER BY "order" ASC',
      [id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/education/modules/:id/quiz ───────────────────────────────────────
export const getQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, question, options, "order" FROM quiz_questions WHERE module_id = $1 ORDER BY "order" ASC',
      [id]
    )
    // Don't send answers to the client
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/education/modules/:id/quiz/submit ──────────────────────────────
export const submitQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { answers } = req.body // { questionId: selectedAnswer }

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, message: 'Answers object required' })
      return
    }

    // Fetch correct answers
    const result = await pool.query(
      'SELECT id, answer, explanation FROM quiz_questions WHERE module_id = $1',
      [id]
    )

    let score = 0
    const total = result.rows.length
    const breakdown = result.rows.map((q: any) => {
      const userAnswer = answers[q.id]
      const correct = userAnswer === q.answer
      if (correct) score++
      return {
        questionId: q.id,
        correct,
        correctAnswer: q.answer,
        userAnswer,
        explanation: q.explanation,
      }
    })

    // Save score
    await pool.query(
      'INSERT INTO quiz_scores (user_id, module_id, score, total) VALUES ($1, $2, $3, $4)',
      [req.user!.userId, id, score, total]
    )

    logger.info(`User ${req.user!.userId} scored ${score}/${total} on module ${id}`)

    res.json({
      success: true,
      data: {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        breakdown,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/education/progress ──────────────────────────────────────────────
export const saveProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.body

    if (!lessonId) {
      res.status(400).json({ success: false, message: 'lessonId required' })
      return
    }

    await pool.query(
      `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, TRUE, NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = TRUE, completed_at = NOW()`,
      [req.user!.userId, lessonId]
    )

    res.json({ success: true, message: 'Progress saved' })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/education/progress ───────────────────────────────────────────────
export const getProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get completed lessons grouped by module
    const result = await pool.query(
      `SELECT
         m.id AS module_id,
         m.title AS module_title,
         m.lesson_count,
         COUNT(up.id)::int AS completed_lessons
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = $1 AND up.completed = TRUE
       GROUP BY m.id, m.title, m.lesson_count
       ORDER BY m."order" ASC`,
      [req.user!.userId]
    )

    // Get quiz scores
    const scores = await pool.query(
      `SELECT module_id, score, total, taken_at
       FROM quiz_scores
       WHERE user_id = $1
       ORDER BY taken_at DESC`,
      [req.user!.userId]
    )

    res.json({
      success: true,
      data: {
        modules: result.rows,
        quizScores: scores.rows,
      },
    })
  } catch (err) {
    next(err)
  }
}
