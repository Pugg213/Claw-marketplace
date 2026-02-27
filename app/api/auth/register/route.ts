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
    const username = String(body.username || '').trim()

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'email and password required' } },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: 'WEAK_PASSWORD', message: 'password must be at least 8 characters' } },
        { status: 400 }
      )
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json(
        { error: { code: 'EMAIL_TAKEN', message: 'email already registered' } },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        username: username || null,
        passwordHash,
        role: 'USER',
      },
      select: { id: true, email: true, username: true, role: true },
    })

    const token = signToken({ userId: user.id, role: user.role })

    return NextResponse.json({ user, token })
  } catch (e) {
    console.error('register error', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
