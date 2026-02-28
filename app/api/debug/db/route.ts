import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>('SELECT 1 as ok')
    return NextResponse.json({ ok: true, rows })
  } catch (e: any) {
    console.error('debug db error', e)
    const debug = process.env.DEBUG_ERRORS === '1'
    return NextResponse.json(
      {
        ok: false,
        error: debug
          ? {
              name: e?.name,
              message: e?.message,
              code: e?.code,
              meta: e?.meta,
            }
          : { message: 'Internal error' },
      },
      { status: 500 }
    )
  }
}
