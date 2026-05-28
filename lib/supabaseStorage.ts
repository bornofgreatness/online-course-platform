import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export const STORAGE_FOLDERS = ['videos', 'pdfs', 'thumbnails', 'materials'] as const
export type StorageFolder = (typeof STORAGE_FOLDERS)[number]

let adminClient: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
    )
  }
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      supabaseStorageBucket()
  )
}

export function supabaseStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'course-files'
}

export function supabasePublicObjectUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
  const bucket = supabaseStorageBucket()
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${base}/storage/v1/object/public/${bucket}/${encodedKey}`
}

/** Extract storage object path from a public/signed Supabase URL or raw key. */
export function supabaseObjectKeyFromUrlOrKey(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    return raw.replace(/^\/+/, '')
  }

  try {
    const url = new URL(raw)
    const bucket = supabaseStorageBucket()
    const prefixes = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ]
    for (const prefix of prefixes) {
      if (url.pathname.startsWith(prefix)) {
        return decodeURIComponent(url.pathname.slice(prefix.length))
      }
    }
  } catch {
    return null
  }

  return null
}

export async function uploadToSupabaseStorage(
  file: Buffer,
  opts: { folder: StorageFolder; filename: string; contentType: string }
): Promise<{ key: string; url: string }> {
  if (!STORAGE_FOLDERS.includes(opts.folder)) {
    throw new Error('Pasta inválida')
  }

  const safeName = opts.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const key = `${opts.folder}/${randomBytes(8).toString('hex')}-${safeName}`
  const bucket = supabaseStorageBucket()

  const { error } = await getSupabaseAdmin().storage.from(bucket).upload(key, file, {
    contentType: opts.contentType,
    upsert: false,
    cacheControl: '3600',
  })

  if (error) {
    throw new Error(error.message)
  }

  return { key, url: supabasePublicObjectUrl(key) }
}

export async function signedSupabaseObjectUrl(
  key: string,
  opts: { expiresInSeconds?: number; filename?: string } = {}
): Promise<string> {
  const bucket = supabaseStorageBucket()
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(key, opts.expiresInSeconds ?? 60 * 5, {
      download: opts.filename ? opts.filename : false,
    })

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Falha ao gerar URL assinada do Supabase')
  }

  return data.signedUrl
}
