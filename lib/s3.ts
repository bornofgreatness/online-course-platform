import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomBytes } from 'crypto'

const ALLOWED_FOLDERS = ['videos', 'pdfs', 'thumbnails', 'materials'] as const
export type S3Folder = (typeof ALLOWED_FOLDERS)[number]

function s3Client() {
  const region = process.env.AWS_REGION || 'us-east-1'
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
  )
}

export function publicObjectUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE
  if (base) return `${base.replace(/\/$/, '')}/${key}`
  const bucket = process.env.S3_BUCKET_NAME
  const region = process.env.AWS_REGION || 'us-east-1'
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

export async function uploadToS3(
  file: Buffer,
  opts: { folder: S3Folder; filename: string; contentType: string }
): Promise<{ key: string; url: string }> {
  if (!isS3Configured()) {
    throw new Error('S3 não configurado (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME)')
  }

  if (!ALLOWED_FOLDERS.includes(opts.folder)) {
    throw new Error('Pasta inválida')
  }

  const safeName = opts.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const key = `${opts.folder}/${randomBytes(8).toString('hex')}-${safeName}`
  const bucket = process.env.S3_BUCKET_NAME!

  await s3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: opts.contentType,
    })
  )

  return { key, url: publicObjectUrl(key) }
}
