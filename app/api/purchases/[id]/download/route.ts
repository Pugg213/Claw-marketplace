import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseId = params.id
    
    // Find purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        agent: true,
        buyer: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Purchase not found' } },
        { status: 404 }
      )
    }

    // Check if completed
    if (purchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: { code: 'NOT_PAID', message: 'Payment not completed' } },
        { status: 400 }
      )
    }

    // Return archive URL (in real app, generate signed URL)
    return NextResponse.json({
      downloadUrl: purchase.agent.archiveUrl,
      agent: {
        id: purchase.agent.id,
        title: purchase.agent.title,
        description: purchase.agent.description
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
