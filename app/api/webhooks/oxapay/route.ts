import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { oxapay } from '@/lib/oxapay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, orderId } = body

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify payment via OxaPay API (more secure than trusting webhook body)
    let paymentInfo: any
    try {
      paymentInfo = await oxapay.checkPayment(paymentId)
    } catch (oxapayError) {
      console.error('Oxapay API error:', oxapayError)
      return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 })
    }

    if (paymentInfo.errorCode !== 0) {
      console.error('Oxapay checkPayment error:', paymentInfo.message)
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const paymentStatus = paymentInfo.result?.paymentStatus
    const paid = paymentStatus === 'Paid' || paymentStatus === 'Complete' || paymentStatus === 'Completed'
    if (!paid) {
      return NextResponse.json({ success: false, status: paymentStatus })
    }

    // Subscription order: sub:<userId>:<uuid>
    if (typeof orderId === 'string' && orderId.startsWith('sub:')) {
      const parts = orderId.split(':')
      const userId = parts[1]
      const amountPaid = parseFloat(paymentInfo.result?.amountPaid || '0')
      const amountExpected = parseFloat(process.env.PRO_PRICE_USDT || '10')

      if (amountPaid + 1e-9 < amountExpected) {
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
      }

      const now = new Date()
      const current = await prisma.user.findUnique({ where: { id: userId }, select: { proUntil: true } })
      const base = current?.proUntil && current.proUntil > now ? current.proUntil : now
      const next = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)

      await prisma.user.update({ where: { id: userId }, data: { proUntil: next } })
      return NextResponse.json({ success: true, subscription: true })
    }

    // Purchase order (format: purchaseId:uuid)
    const [purchaseId] = String(orderId).split(':')

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { agent: true },
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (purchase.status === 'COMPLETED') {
      return NextResponse.json({ success: true, already: true })
    }

    const amountPaid = parseFloat(paymentInfo.result?.amountPaid || '0')
    const amountExpected = parseFloat(purchase.amountUsdt.toString())
    if (amountPaid + 1e-9 < amountExpected) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    await prisma.purchase.update({ where: { id: purchaseId }, data: { status: 'COMPLETED' } })
    await prisma.agent.update({ where: { id: purchase.agentId }, data: { downloads: { increment: 1 } } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
