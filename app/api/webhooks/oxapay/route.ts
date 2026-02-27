import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify it's from Oxapay (you might want to add signature verification)
    const { paymentId, status, amount, orderId } = body

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

    // Check payment status
    if (status === 'Paid' || status === 'Complete' || status === 'Completed') {
      // Update purchase status
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED' }
      })

      // Increment download count
      await prisma.agent.update({
        where: { id: purchase.agentId },
        data: { downloads: { increment: 1 } }
      })
    } else if (status === 'Failed' || status === 'Expired') {
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
