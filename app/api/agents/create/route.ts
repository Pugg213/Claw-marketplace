import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { uploadToStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Auth
    const auth = getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'auth required' } },
        { status: 401 }
      )
    }
    const sellerId = auth.userId

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const priceUsdt = parseFloat(formData.get('priceUsdt') as string)
    const previewJson = formData.get('previewJson') as string

    if (!file || !sellerId || !title || !category || !priceUsdt) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE', message: 'Only ZIP files allowed' } },
        { status: 400 }
      )
    }

    // Validate size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'Max file size is 100MB' } },
        { status: 400 }
      )
    }

    // Upload to S3/R2
    const folderId = uuidv4()
    const fileName = `${folderId}.zip`
    const s3Key = `agents/${fileName}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const archiveUrl = await uploadToStorage(s3Key, fileBuffer, 'application/zip')

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        sellerId,
        title,
        description,
        category,
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
        priceUsdt,
        archiveUrl,
        previewJson: previewJson ? JSON.parse(previewJson) : null,
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
