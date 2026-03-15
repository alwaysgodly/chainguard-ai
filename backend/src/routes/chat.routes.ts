import { Router } from 'express'
const router = Router()

// TODO: Add chat route handlers
router.get('/', (_, res) => res.json({ module: 'chat', status: 'coming soon' }))

export default router
