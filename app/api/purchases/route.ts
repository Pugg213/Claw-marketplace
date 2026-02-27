import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { oxapay } from '@/lib/oxapay'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, buyerId } = body

    if (!agentId || !buyerId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'agentId and buyerId required' } },
        { status: 400 }
      )
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent || agent.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Agent not found or not available' } },
        { status: 404 }
      )
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        buyerId_agentId: { buyerId, agentId }
      }
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: { code: 'ALREADY_PURCHASED', message: 'Already purchased' } },
        { status: 400 }
      )
    }

    // Calculate fees
    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '30')
    const price = parseFloat(agent.priceUsdt.toString())
    const platformFee = price * (platformFeePercent / 100)
    const sellerAmount = price - platformFee

    // Create pending purchase
    const orderId = uuidv4()
    const purchase = await prisma.purchase.create({
      data: {
        buyerId,
        agentId,
        amountUsdt: price,
        platformFee,
        sellerAmount,
        status: 'PENDING'
      }
    })

    // Create Oxapay payment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const payment = await oxapay.createPayment({
      amount: price,
      orderId: `${purchase.id}:${orderId}`,
      description: `Purchase: ${agent.title}`,
      callbackUrl: `${baseUrl}/api/webhooks/oxapay`,
      returnUrl: `${baseUrl}/purchase/success?orderId=${purchase.id}`
    })

    if (payment.errorCode !== 0) {
      await prisma.purchase.delete({ where: { id: purchase.id } })
      return NextResponse.json(
        { error: { code: 'PAYMENT_ERROR', message: payment.message } },
        { status: 500 }
      )
    }

    // Update purchase with payment ID
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { paymentId: payment.result.paymentId }
    })

    return NextResponse.json({
      purchaseId: purchase.id,
      paymentId: payment.result.paymentId,
      payLink: payment.result.payLink,
      amount: price,
      platformFee,
      sellerAmount
    })
  } catch (error) {
    console.error('POST /api/purchases error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
