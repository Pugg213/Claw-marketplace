import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

type StorageBackend = 'supabase' | 'r2'

function getBackend(): StorageBackend {
  if (process.env.STORAGE_BACKEND === 'r2') return 'r2'
  if (process.env.STORAGE_BACKEND === 'supabase') return 'supabase'
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) return 'supabase'
  return 'r2'
}

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'agents'

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const R2_BUCKET = process.env.R2_BUCKET || 'agent-marketplace'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_BASE_URL || ''

function makeSupabaseRef(bucket: string, key: string) {
  return `supabase://${bucket}/${key}`
}

function parseSupabaseRef(ref: string): { bucket: string; key: string } | null {
  if (!ref.startsWith('supabase://')) return null
  const rest = ref.slice('supabase://'.length)
  const idx = rest.indexOf('/')
  if (idx < 0) return null
  return { bucket: rest.slice(0, idx), key: rest.slice(idx + 1) }
}

function parseR2KeyFromUrl(url: string): string {
  const u = new URL(url)
  return u.pathname.replace(/^\//, '')
}

export async function uploadToStorage(key: string, body: Buffer, contentType: string): Promise<string> {
  const backend = getBackend()

  if (backend === 'supabase') {
    if (!supabase) throw new Error('Supabase storage not configured')

    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(key, body, {
      contentType,
      upsert: false,
    })

    if (error) throw new Error(`Supabase upload failed: ${error.message}`)
    return makeSupabaseRef(SUPABASE_BUCKET, key)
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await r2.send(command)
  return `${R2_PUBLIC_URL}/${key}`
}

export async function getSignedDownloadUrlByArchiveUrl(archiveUrl: string, expiresIn = 3600): Promise<string> {
  const supa = parseSupabaseRef(archiveUrl)
  const backend = getBackend()

  if (backend === 'supabase' || supa) {
    if (!supabase) throw new Error('Supabase storage not configured')

    const bucket = supa?.bucket || SUPABASE_BUCKET
    const key = supa?.key || archiveUrl

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, expiresIn)
    if (error) throw new Error(`Supabase signed url failed: ${error.message}`)
    return data.signedUrl
  }

  const key = parseR2KeyFromUrl(archiveUrl)
  const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
  return getSignedUrl(r2, command, { expiresIn })
}
