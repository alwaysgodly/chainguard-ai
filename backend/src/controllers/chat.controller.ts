import { Response, NextFunction } from 'express'
import axios from 'axios'
import pool from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import logger from '../config/logger'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// ── POST /api/chat/sessions ───────────────────────────────────────────────────
export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const title = req.body.title || 'New Chat'
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at`,
      [req.user!.userId, title]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/chat/sessions ────────────────────────────────────────────────────
export const getSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, title, created_at, updated_at FROM chat_sessions
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.user!.userId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/chat/sessions/:id ─────────────────────────────────────────────
export const deleteSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    await pool.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user!.userId]
    )
    res.json({ success: true, message: 'Session deleted' })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/chat/sessions/:id/messages ──────────────────────────────────────
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const session = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user!.userId]
    )
    if (session.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Session not found' })
      return
    }

    const result = await pool.query(
      'SELECT id, role, content, created_at AS timestamp FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/chat/sessions/:id/messages ──────────────────────────────────────
export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, message: 'Message content required' })
      return
    }

    // Verify session ownership
    const session = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user!.userId]
    )
    if (session.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Session not found' })
      return
    }

    // Save user message to DB
    const userMsg = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)
       RETURNING id, role, content, created_at AS timestamp`,
      [id, content]
    )

    let assistantContent: string

    try {
      // ── Call AI service RAG pipeline ────────────────────────────────────────
      // Uses Gemini + FAISS vector store for blockchain-specialized responses
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/chat/message`,
        {
          message:    content,
          session_id: id,
        },
        { timeout: 30_000 }
      )
      assistantContent = aiResponse.data.response || 'I could not generate a response.'
      logger.info(`AI response — intent: ${aiResponse.data.intent}, used_rag: ${aiResponse.data.used_rag}`)
    } catch (err) {
      // Graceful fallback if AI service is down
      logger.warn('AI service unavailable for chat, using fallback')
      assistantContent = generateFallbackResponse(content)
    }

    // Save assistant message to DB
    const assistantMsg = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)
       RETURNING id, role, content, created_at AS timestamp`,
      [id, assistantContent]
    )

    // Update session timestamp
    await pool.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1', [id])

    // Auto-title session from first message
    const msgCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM chat_messages WHERE session_id = $1',
      [id]
    )
    if (msgCount.rows[0].count <= 2) {
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content
      await pool.query('UPDATE chat_sessions SET title = $1 WHERE id = $2', [title, id])
    }

    res.json({
      success: true,
      data: {
        userMessage:      userMsg.rows[0],
        assistantMessage: assistantMsg.rows[0],
      },
    })
  } catch (err) {
    next(err)
  }
}

// ── Fallback response generator ───────────────────────────────────────────────
function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('bitcoin') || lower.includes('btc'))
    return 'Bitcoin (BTC) is the first cryptocurrency, created by Satoshi Nakamoto in 2009. Fixed supply of 21 million BTC, proof-of-work consensus. Would you like to know more about Bitcoin\'s technology or market dynamics?'

  if (lower.includes('ethereum') || lower.includes('eth'))
    return 'Ethereum is a programmable blockchain enabling smart contracts and dApps. It transitioned to proof-of-stake with The Merge in September 2022. What aspect of Ethereum interests you?'

  if (lower.includes('nft'))
    return 'NFTs are unique digital assets stored on a blockchain. Use the NFT Scanner tab to evaluate any collection across 6 risk factors — Contract Safety, Metadata, Trading Patterns, Creator Reputation, Royalty Structure, and Liquidity Risk.'

  if (lower.includes('defi'))
    return 'DeFi (Decentralized Finance) recreates financial services on-chain without intermediaries. Key protocols: Uniswap (DEX), Aave (lending), MakerDAO (stablecoins). What would you like to explore?'

  if (lower.includes('blockchain'))
    return 'A blockchain is a distributed, immutable ledger recording transactions across a network. Key properties: decentralization, immutability, and transparency. What would you like to know more about?'

  if (lower.includes('hello') || lower.includes('hi'))
    return 'Hello! 👋 I\'m the ChainGuard AI assistant powered by Gemini + RAG. I can help with blockchain concepts, crypto analysis, NFT risk, and DeFi. What would you like to explore?'

  return 'Great question! I can help with blockchain, cryptocurrency, NFTs, and DeFi. The AI service may be temporarily unavailable — try asking about Bitcoin, Ethereum, DeFi protocols, or NFT risk factors.'
}