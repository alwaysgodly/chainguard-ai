import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  createSession,
  getSessions,
  deleteSession,
  getMessages,
  sendMessage,
} from '../controllers/chat.controller'

const router = Router()

// All chat endpoints require authentication
router.post  ('/sessions',                protect, createSession)  // POST   /api/chat/sessions
router.get   ('/sessions',                protect, getSessions)    // GET    /api/chat/sessions
router.delete('/sessions/:id',            protect, deleteSession)  // DELETE /api/chat/sessions/:id
router.get   ('/sessions/:id/messages',   protect, getMessages)    // GET    /api/chat/sessions/:id/messages
router.post  ('/sessions/:id/messages',   protect, sendMessage)    // POST   /api/chat/sessions/:id/messages

export default router
