import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'email and password required' } },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'invalid credentials' } },
        { status: 401 }
      )
    }

    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token,
    })
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
