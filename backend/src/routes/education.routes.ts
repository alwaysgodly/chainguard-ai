import { Router } from 'express'
const router = Router()

// TODO: Add education route handlers
router.get('/', (_, res) => res.json({ module: 'education', status: 'coming soon' }))

export default router
