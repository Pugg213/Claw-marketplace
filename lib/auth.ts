import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export type AuthUser = {
  userId: string
  role?: string
}

export function signToken(payload: AuthUser) {
  const secret = process.env.JWT_SECRET || ''
  if (!secret) throw new Error('JWT_SECRET not set')
  return jwt.sign(payload, secret, { expiresIn: '30d' })
}

export function verifyToken(token: string): AuthUser {
  const secret = process.env.JWT_SECRET || ''
  if (!secret) throw new Error('JWT_SECRET not set')
  return jwt.verify(token, secret) as AuthUser
}

export function getAuthUser(req: NextRequest): AuthUser | null {
  const auth = req.headers.get('authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  try {
    return verifyToken(m[1])
  } catch {
    return null
  }
}
