import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    // sellerId is taken from auth token
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

    // Save file
    const uploadDir = process.env.UPLOAD_DIR || '/uploads'
    const folderId = uuidv4()
    const agentDir = join(uploadDir, 'agents', folderId)
    await mkdir(agentDir, { recursive: true })
    
    const fileName = `${uuidv4()}.zip`
    const filePath = join(agentDir, fileName)
    const fileBuffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(fileBuffer))

    const archiveUrl = `/uploads/agents/${folderId}/${fileName}`

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
        status: 'PUBLISHED' // Auto-publish for now, can add moderation later
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
