import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import {
  isObjectStorageConfigured,
  uploadObject,
  type StorageFolder,
} from '../../../../lib/storage'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 500 * 1024 * 1024 // 500 MB

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }

  if (!isObjectStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          'Armazenamento não configurado. Defina NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_STORAGE_BUCKET (Supabase), ou credenciais S3.',
      },
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

  const allowed: StorageFolder[] = ['videos', 'pdfs', 'thumbnails', 'materials']
  if (!allowed.includes(folder as StorageFolder)) {
    return NextResponse.json({ error: 'Pasta inválida' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'application/octet-stream'

  const validType =
    folder === 'pdfs'
      ? contentType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      : folder === 'thumbnails'
        ? contentType.startsWith('image/')
        : folder === 'videos'
          ? contentType.startsWith('video/')
          : true

  if (!validType) {
    return NextResponse.json({ error: 'Tipo de arquivo inválido para a pasta selecionada' }, { status: 400 })
  }

  try {
    const result = await uploadObject(buffer, {
      folder: folder as StorageFolder,
      filename: file.name,
      contentType,
    })

    return NextResponse.json({
      url: result.url,
      key: result.key,
      provider: result.provider,
      contentType,
      size: file.size,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Falha no upload'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
