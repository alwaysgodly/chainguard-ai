import jwt, { SignOptions } from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email:  string
  role:   string
}

// ── Generate access token (short-lived: 15m) ──────────────────────────────────
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: 900, // 15 minutes in seconds
  }
  return jwt.sign(payload, process.env.JWT_SECRET as string, options)
}

// ── Generate refresh token (long-lived: 7d) ───────────────────────────────────
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: 604800, // 7 days in seconds
  }
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, options)
}

// ── Verify access token ───────────────────────────────────────────────────────
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
}

// ── Verify refresh token ──────────────────────────────────────────────────────
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload
}