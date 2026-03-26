import { Router } from 'express'
import { coins, coinChart, global, fearGreed } from '../controllers/analytics.controller'

const router = Router()

// All analytics endpoints are public (no auth required)
router.get('/coins',           coins)       // GET /api/analytics/coins
router.get('/coins/:id/chart', coinChart)    // GET /api/analytics/coins/:id/chart?days=30
router.get('/global',          global)       // GET /api/analytics/global
router.get('/fear-greed',      fearGreed)    // GET /api/analytics/fear-greed

export default router
