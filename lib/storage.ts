/**
 * Object storage facade — prefers Supabase Storage, falls back to S3/R2.
 */
import {
  isS3Configured,
  s3ObjectKeyFromUrlOrKey,
  signedObjectUrl as signedS3ObjectUrl,
  uploadToS3,
  type S3Folder,
} from './s3'
import {
  isSupabaseStorageConfigured,
  signedSupabaseObjectUrl,
  supabaseObjectKeyFromUrlOrKey,
  uploadToSupabaseStorage,
  type StorageFolder,
} from './supabaseStorage'

export type { StorageFolder }
export type ObjectStorageFolder = StorageFolder | S3Folder

const STORAGE_FOLDER_PREFIX = /^(videos|pdfs|thumbnails|materials)\//

export function isObjectStorageConfigured(): boolean {
  return isSupabaseStorageConfigured() || isS3Configured()
}

export function objectStorageProvider(): 'supabase' | 's3' | null {
  if (isSupabaseStorageConfigured()) return 'supabase'
  if (isS3Configured()) return 's3'
  return null
}

export function objectKeyFromUrlOrKey(value: string): string | null {
  return supabaseObjectKeyFromUrlOrKey(value) ?? s3ObjectKeyFromUrlOrKey(value)
}

function resolveKeyForSignedUrl(target: string): { key: string; provider: 'supabase' | 's3' } | null {
  const fromSupabase = supabaseObjectKeyFromUrlOrKey(target)
  if (fromSupabase && isSupabaseStorageConfigured()) {
    return { key: fromSupabase, provider: 'supabase' }
  }

  const fromS3 = s3ObjectKeyFromUrlOrKey(target)
  if (fromS3 && isS3Configured()) {
    return { key: fromS3, provider: 's3' }
  }

  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    const key = target.replace(/^\/+/, '')
    if (isSupabaseStorageConfigured() && STORAGE_FOLDER_PREFIX.test(key)) {
      return { key, provider: 'supabase' }
    }
    if (isS3Configured()) {
      return { key, provider: 's3' }
    }
  }

  return null
}

export async function uploadObject(
  file: Buffer,
  opts: { folder: StorageFolder; filename: string; contentType: string }
): Promise<{ key: string; url: string; provider: 'supabase' | 's3' }> {
  if (isSupabaseStorageConfigured()) {
    const result = await uploadToSupabaseStorage(file, opts)
    return { ...result, provider: 'supabase' }
  }
  if (isS3Configured()) {
    const result = await uploadToS3(file, opts)
    return { ...result, provider: 's3' }
  }
  throw new Error(
    'Armazenamento não configurado. Defina Supabase Storage (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET) ou S3.'
  )
}

export async function signedObjectUrl(
  target: string,
  opts: { expiresInSeconds?: number; filename?: string } = {}
): Promise<string> {
  const resolved = resolveKeyForSignedUrl(target)
  if (!resolved) {
    throw new Error('Não foi possível resolver o arquivo no armazenamento')
  }

  if (resolved.provider === 'supabase') {
    return signedSupabaseObjectUrl(resolved.key, opts)
  }

  return signedS3ObjectUrl(resolved.key, opts)
}
