import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import {
  getCertificateIssuanceLocation,
  setCertificateIssuanceLocation,
} from '../../../../lib/certificateSettings'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    const prisma = getPrisma()
    const location = await getCertificateIssuanceLocation(prisma)
    return NextResponse.json(location)
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json().catch(() => ({}))
    const prisma = getPrisma()
    const location = await setCertificateIssuanceLocation(prisma, {
      city: typeof body.city === 'string' ? body.city : '',
      state: typeof body.state === 'string' ? body.state : '',
    })
    return NextResponse.json(location)
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    const message = err?.message || 'Failed to save certificate settings'
    const status =
      err?.statusCode ||
      (message.includes('Invalid') ? 400 : 500)
    return NextResponse.json({ error: message }, { status })
  }
}
