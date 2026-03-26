import { Request, Response, NextFunction } from 'express'
import { getCoins, getCoinChart, getGlobalData, getFearGreedIndex } from '../services/coingecko.service'

// ── GET /api/analytics/coins ──────────────────────────────────────────────────
export const coins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const perPage = Math.min(parseInt(req.query.per_page as string) || 20, 100)
    const data = await getCoins(page, perPage)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/analytics/coins/:id/chart ────────────────────────────────────────
export const coinChart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const days = req.query.days as string || '30'
    const data = await getCoinChart(id, days)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/analytics/global ─────────────────────────────────────────────────
export const global = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getGlobalData()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/analytics/fear-greed ─────────────────────────────────────────────
export const fearGreed = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getFearGreedIndex()
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
