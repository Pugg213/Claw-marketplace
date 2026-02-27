import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { getSignedDownloadUrlByArchiveUrl } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const auth = getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'auth required' } },
        { status: 401 }
      )
    }

    const purchaseId = params.id
    
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

    // Verify buyer owns this purchase
    if (purchase.buyerId !== auth.userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not your purchase' } },
        { status: 403 }
      )
    }

    if (purchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: { code: 'NOT_PAID', message: 'Payment not completed' } },
        { status: 400 }
      )
    }
    const signedUrl = await getSignedDownloadUrlByArchiveUrl(purchase.agent.archiveUrl, 3600)

    return NextResponse.json({
      downloadUrl: signedUrl,
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
