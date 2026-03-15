// ── Auth ──────────────────────────────────────────────
export interface User {
  id: string
  email: string
  role: 'guest' | 'learner' | 'pro' | 'admin'
  walletAddress?: string
  createdAt: string
}

// ── Education ─────────────────────────────────────────
export interface Module {
  id: string
  title: string
  description: string
  category: 'basics' | 'defi' | 'nft' | 'security' | 'advanced'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lessonCount: number
  estimatedMinutes: number
  completedLessons?: number
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  content: string
  order: number
}

// ── Analytics ─────────────────────────────────────────
export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

export interface PricePoint {
  timestamp: number
  price: number
}

// ── NFT Risk ──────────────────────────────────────────
export type RiskBand = 'safe' | 'low' | 'medium' | 'high' | 'critical'

export interface RiskFactor {
  name: string
  description: string
  severity: RiskBand
  score: number
}

export interface NFTRiskReport {
  reportId: string
  contractAddress: string
  riskScore: number
  riskBand: RiskBand
  factors: RiskFactor[]
  evaluatedAt: string
}

// ── Chat ──────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}
