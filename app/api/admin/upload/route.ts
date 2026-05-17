import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import { isS3Configured, uploadToS3, type S3Folder } from '../../../../lib/s3'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 500 * 1024 * 1024 // 500 MB

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { error: 'S3 não configurado. Defina AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e S3_BUCKET_NAME.' },
      { status: 503 }
    )
  }

  const form = await request.formData()
  const file = form.get('file')
  const folder = (form.get('folder') as string) || 'materials'

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 500 MB)' }, { status: 400 })
  }

  const allowed: S3Folder[] = ['videos', 'pdfs', 'thumbnails', 'materials']
  if (!allowed.includes(folder as S3Folder)) {
    return NextResponse.json({ error: 'Pasta inválida' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'application/octet-stream'

  const result = await uploadToS3(buffer, {
    folder: folder as S3Folder,
    filename: file.name,
    contentType,
  })

  return NextResponse.json({
    url: result.url,
    key: result.key,
    contentType,
    size: file.size,
  })
}
