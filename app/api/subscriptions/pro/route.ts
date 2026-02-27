import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { getAuthUser } from '@/lib/auth'
import { oxapay } from '@/lib/oxapay'
import { v4 as uuidv4 } from 'uuid'
import { getBaseUrl } from '@/lib/base-url'

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request)
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'auth required' } },
      { status: 401 }
    )
  }

  const amount = parseFloat(process.env.PRO_PRICE_USDT || '10')
  const baseUrl = getBaseUrl(request)
  const orderId = `sub:${auth.userId}:${uuidv4()}`

  const payment = await oxapay.createPayment({
    amount,
    orderId,
    description: `OpenClaw PRO (30 days)`,
    callbackUrl: `${baseUrl}/api/webhooks/oxapay`,
    returnUrl: `${baseUrl}/openclaw/pro`,
  })

  if (payment.errorCode !== 0) {
    return NextResponse.json(
      { error: { code: 'PAYMENT_ERROR', message: payment.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ paymentId: payment.result.paymentId, payLink: payment.result.payLink, amount })
}
