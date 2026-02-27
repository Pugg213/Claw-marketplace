import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'auth required' } }, { status: 401 })
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    include: { agent: true },
  })
  if (!purchase) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'not found' } }, { status: 404 })
  }
  if (purchase.buyerId !== auth.userId) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not your purchase' } }, { status: 403 })
  }

  return NextResponse.json({
    id: purchase.id,
    status: purchase.status,
    amount_usdt: purchase.amountUsdt,
    agent: { id: purchase.agentId, title: purchase.agent.title },
    created_at: purchase.createdAt,
  })
}
