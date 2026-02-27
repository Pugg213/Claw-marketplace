import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { oxapay } from '@/lib/oxapay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, amount, walletAddress, network } = body

    if (!sellerId || !amount || !walletAddress || !network) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      )
    }

    // Get seller
    const seller = await prisma.user.findUnique({
      where: { id: sellerId }
    })

    if (!seller) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Seller not found' } },
        { status: 404 }
      )
    }

    // Calculate available balance (mock - in real app calculate from completed purchases)
    const availableBalance = 100 // Mock
    
    if (parseFloat(amount) > availableBalance) {
      return NextResponse.json(
        { error: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance' } },
        { status: 400 }
      )
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        sellerId,
        amountUsdt: parseFloat(amount),
        walletAddress,
        network,
        status: 'PENDING'
      }
    })

    // Process payout via Oxapay
    try {
      const result = await oxapay.createPayout({
        amount: parseFloat(amount),
        address: walletAddress,
        network: network
      })

      if (result.errorCode === 0 && result.result) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'PROCESSING',
            txHash: result.result.txHash
          }
        })

        return NextResponse.json({
          success: true,
          payoutId: payout.id,
          txHash: result.result.txHash
        })
      } else {
        await prisma.payout.update({
          where: { id: payout.id },
          data: { status: 'FAILED' }
        })

        return NextResponse.json(
          { error: { code: 'PAYOUT_FAILED', message: result.message } },
          { status: 500 }
        )
      }
    } catch (oxapayError) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'FAILED' }
      })
      
      return NextResponse.json(
        { error: { code: 'PAYOUT_ERROR', message: 'Failed to process payout' } },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Payout error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
