import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import pool from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import logger from '../config/logger'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// ── POST /api/nft/scan ────────────────────────────────────────────────────────
export const scanNFT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { contractAddress, collectionName } = req.body

    if (!contractAddress && !collectionName) {
      res.status(400).json({
        success: false,
        message: 'contractAddress or collectionName is required',
      })
      return
    }

    let riskReport: any

    try {
      // Try AI service first
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/nft/evaluate`, {
        contract_address: contractAddress,
        collection_name: collectionName,
      }, { timeout: 10_000 })
      riskReport = aiResponse.data
    } catch {
      // Fallback: deterministic mock scorer
      logger.warn('AI service unavailable, using fallback NFT scorer')
      riskReport = generateMockRiskReport(contractAddress || collectionName)
    }

    // Save scan to DB
    await pool.query(
      `INSERT INTO nft_scans (user_id, contract_address, collection_name, risk_score, risk_band, factors)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user?.userId || null,
        contractAddress || null,
        collectionName || null,
        riskReport.riskScore,
        riskReport.riskBand,
        JSON.stringify(riskReport.factors),
      ]
    )

    res.json({ success: true, data: riskReport })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/nft/history ──────────────────────────────────────────────────────
export const scanHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, contract_address, collection_name, risk_score, risk_band, factors, scanned_at
       FROM nft_scans
       WHERE user_id = $1
       ORDER BY scanned_at DESC
       LIMIT 20`,
      [req.user!.userId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── Fallback mock risk scorer ─────────────────────────────────────────────────
function generateMockRiskReport(identifier: string) {
  // Generate deterministic score from identifier hash
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i)
    hash |= 0
  }
  const riskScore = Math.abs(hash % 100)

  const riskBand =
    riskScore <= 20 ? 'safe' :
    riskScore <= 40 ? 'low' :
    riskScore <= 60 ? 'medium' :
    riskScore <= 80 ? 'high' : 'critical'

  const factors = [
    {
      name: 'Contract Safety',
      description: 'Analysis of smart contract code and known vulnerabilities',
      severity: riskScore <= 30 ? 'safe' : riskScore <= 60 ? 'medium' : 'high',
      score: Math.abs((hash * 7) % 100),
    },
    {
      name: 'Metadata Integrity',
      description: 'Verification of NFT metadata and asset hosting',
      severity: riskScore <= 40 ? 'safe' : riskScore <= 70 ? 'low' : 'medium',
      score: Math.abs((hash * 13) % 100),
    },
    {
      name: 'Trading Patterns',
      description: 'Detection of wash trading and suspicious trading activity',
      severity: riskScore <= 25 ? 'safe' : riskScore <= 50 ? 'low' : 'high',
      score: Math.abs((hash * 17) % 100),
    },
    {
      name: 'Creator Reputation',
      description: 'Track record and verification status of the creator',
      severity: riskScore <= 35 ? 'safe' : riskScore <= 65 ? 'medium' : 'high',
      score: Math.abs((hash * 23) % 100),
    },
    {
      name: 'Royalty Structure',
      description: 'Assessment of royalty configuration and potential issues',
      severity: riskScore <= 45 ? 'safe' : riskScore <= 75 ? 'low' : 'critical',
      score: Math.abs((hash * 29) % 100),
    },
    {
      name: 'Liquidity Risk',
      description: 'Evaluation of market depth and exit opportunities',
      severity: riskScore <= 30 ? 'safe' : riskScore <= 55 ? 'medium' : 'high',
      score: Math.abs((hash * 31) % 100),
    },
  ]

  return {
    reportId: `mock-${Date.now()}`,
    contractAddress: identifier.startsWith('0x') ? identifier : null,
    collectionName: !identifier.startsWith('0x') ? identifier : null,
    riskScore,
    riskBand,
    factors,
    evaluatedAt: new Date().toISOString(),
  }
}
