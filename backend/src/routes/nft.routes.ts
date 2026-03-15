import { Router } from 'express'
const router = Router()

// TODO: Add nft route handlers
router.get('/', (_, res) => res.json({ module: 'nft', status: 'coming soon' }))

export default router
