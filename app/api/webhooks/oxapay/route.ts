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

    // Idempotency: if already completed, do nothing
    if (purchase.status === 'COMPLETED') {
      return NextResponse.json({ success: true, already: true })
    }

    // Verify payment via OxaPay API (more secure than trusting webhook body)
    try {
      const paymentInfo = await oxapay.checkPayment(paymentId)
      
      if (paymentInfo.errorCode !== 0) {
        console.error('Oxapay checkPayment error:', paymentInfo.message)
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
      }

      const paymentStatus = paymentInfo.result?.paymentStatus
      const amountPaid = parseFloat(paymentInfo.result?.amountPaid || '0')
      const amountExpected = parseFloat(purchase.amountUsdt.toString())

      // Verify amount matches
      if (amountPaid < amountExpected) {
        console.error('Amount mismatch:', amountPaid, amountExpected)
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
      }

      const paid = paymentStatus === 'Paid' || paymentStatus === 'Complete' || paymentStatus === 'Completed'

      if (paid) {
        await prisma.purchase.update({
          where: { id: purchaseId },
          data: { status: 'COMPLETED' }
        })

        await prisma.agent.update({
          where: { id: purchase.agentId },
          data: { downloads: { increment: 1 } }
        })

        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ success: false, status: paymentStatus })
      }
    } catch (oxapayError) {
      console.error('Oxapay API error:', oxapayError)
      // If OxaPay API fails, don't mark as failed - just log and return
      return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 })
    }

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
