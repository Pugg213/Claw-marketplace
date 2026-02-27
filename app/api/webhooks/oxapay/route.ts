import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Simple shared-secret verification (minimum viable)
    const secret = process.env.OXAPAY_WEBHOOK_SECRET || ''
    if (secret) {
      const got = request.headers.get('x-oxapay-webhook-secret') || ''
      if (got !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()

    const { paymentId, status, orderId } = body

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Parse orderId (format: purchaseId:uuid)
    const [purchaseId] = orderId.split(':')

    // Find purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { agent: true }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Verify paymentId matches the one we issued
    if (purchase.paymentId && purchase.paymentId !== paymentId) {
      return NextResponse.json({ error: 'paymentId mismatch' }, { status: 400 })
    }

    const paid = status === 'Paid' || status === 'Complete' || status === 'Completed'
    const failed = status === 'Failed' || status === 'Expired'

    // Idempotency: if already completed, do nothing
    if (purchase.status === 'COMPLETED') {
      return NextResponse.json({ success: true, already: true })
    }

    if (paid) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED' }
      })

      await prisma.agent.update({
        where: { id: purchase.agentId },
        data: { downloads: { increment: 1 } }
      })
    } else if (failed) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'FAILED' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
