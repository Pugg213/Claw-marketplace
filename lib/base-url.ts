import { NextRequest } from 'next/server'

// Prefer explicit env, but auto-detect on Vercel/behind proxies.
export function getBaseUrl(req?: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL
  if (env && env.trim()) return env.trim().replace(/\/$/, '')

  if (!req) return 'http://localhost:3000'

  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!host) return 'http://localhost:3000'

  return `${proto}://${host}`
}
