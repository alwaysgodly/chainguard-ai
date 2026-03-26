import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import { scanNFT, scanHistory } from '../controllers/nft.controller'

const router = Router()

router.post('/scan',    protect, scanNFT)      // POST /api/nft/scan
router.get ('/history', protect, scanHistory)   // GET  /api/nft/history

export default router
