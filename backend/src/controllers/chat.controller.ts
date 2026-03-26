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

// ── GET /api/chat/sessions/:id/messages ───────────────────────────────────────
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Verify ownership
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

    // Verify ownership
    const session = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user!.userId]
    )
    if (session.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Session not found' })
      return
    }

    // Save user message
    const userMsg = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)
       RETURNING id, role, content, created_at AS timestamp`,
      [id, content]
    )

    // Get conversation history for context
    const history = await pool.query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    )

    let assistantContent: string

    try {
      // Proxy to AI service
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat/respond`, {
        messages: history.rows,
        user_message: content,
      }, { timeout: 30_000 })
      assistantContent = aiResponse.data.response || aiResponse.data.content || 'I apologize, I could not generate a response.'
    } catch {
      // Fallback response
      logger.warn('AI service unavailable for chat, using fallback')
      assistantContent = generateFallbackResponse(content)
    }

    // Save assistant message
    const assistantMsg = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)
       RETURNING id, role, content, created_at AS timestamp`,
      [id, assistantContent]
    )

    // Update session timestamp
    await pool.query(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
      [id]
    )

    // Update session title from first message
    const msgCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM chat_messages WHERE session_id = $1',
      [id]
    )
    if (msgCount.rows[0].count <= 2) {
      const title = content.length > 50 ? content.substring(0, 47) + '...' : content
      await pool.query(
        'UPDATE chat_sessions SET title = $1 WHERE id = $2',
        [title, id]
      )
    }

    res.json({
      success: true,
      data: {
        userMessage: userMsg.rows[0],
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
    return 'Bitcoin (BTC) is the first and most well-known cryptocurrency, created by the pseudonymous Satoshi Nakamoto in 2009. It operates on a proof-of-work consensus mechanism and has a fixed supply of 21 million coins. Would you like to learn more about Bitcoin\'s technology or its market dynamics?'

  if (lower.includes('ethereum') || lower.includes('eth'))
    return 'Ethereum (ETH) is a decentralized blockchain platform that enables smart contracts and decentralized applications (dApps). It transitioned from proof-of-work to proof-of-stake with "The Merge" in September 2022. What specific aspect of Ethereum interests you?'

  if (lower.includes('nft'))
    return 'NFTs (Non-Fungible Tokens) are unique digital assets stored on a blockchain. They can represent art, music, collectibles, and more. Each NFT has a unique identifier that distinguishes it from other tokens. Would you like to learn about NFT risks or how to evaluate them?'

  if (lower.includes('defi'))
    return 'DeFi (Decentralized Finance) refers to financial services built on blockchain technology that operate without traditional intermediaries. Key concepts include liquidity pools, yield farming, and decentralized exchanges. What aspect of DeFi would you like to explore?'

  if (lower.includes('blockchain'))
    return 'A blockchain is a distributed, immutable ledger that records transactions across a network of computers. Key features include decentralization, transparency, and cryptographic security. Each block contains a hash of the previous block, creating a secure chain. What would you like to know more about?'

  if (lower.includes('wallet'))
    return 'A crypto wallet is a tool that allows you to store, send, and receive cryptocurrencies. There are hot wallets (connected to the internet) and cold wallets (offline storage). Popular options include MetaMask, Ledger, and Trust Wallet. Would you like recommendations or security tips?'

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return 'Hello! 👋 I\'m the ChainGuard AI assistant. I can help you with blockchain concepts, cryptocurrency analysis, NFT risk assessment, and DeFi topics. What would you like to explore today?'

  return 'That\'s a great question about blockchain and crypto! While I\'m currently running in offline mode, I can still help with general blockchain concepts, cryptocurrency fundamentals, NFT basics, and DeFi principles. Could you be more specific about what you\'d like to learn? Try asking about Bitcoin, Ethereum, NFTs, DeFi, or blockchain technology.'
}
