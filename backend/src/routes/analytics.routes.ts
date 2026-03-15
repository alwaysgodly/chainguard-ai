import { Router } from 'express'
const router = Router()

// TODO: Add analytics route handlers
router.get('/', (_, res) => res.json({ module: 'analytics', status: 'coming soon' }))

export default router
