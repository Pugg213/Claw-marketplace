import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { oxapay } from '@/lib/oxapay'
import { v4 as uuidv4 } from 'uuid'
import { getAuthUser } from '@/lib/auth'
import { getBaseUrl } from '@/lib/base-url'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'auth required' } },
        { status: 401 }
      )
    }

    const items = await prisma.purchase.findMany({
      where: { buyerId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        agent: { select: { id: true, title: true, archiveUrl: true } },
      },
    })

    return NextResponse.json({ purchases: items })
  } catch (e) {
    console.error('GET /api/purchases error', e)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'agentId required' } },
        { status: 400 }
      )
    }

    const auth = getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'auth required' } },
        { status: 401 }
      )
    }
    const buyerId = auth.userId


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
    const baseUrl = getBaseUrl(request)
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
