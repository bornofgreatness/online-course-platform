import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import { getPrisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const prisma = getPrisma()
    const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ campaigns })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const bodyHtml = typeof body?.bodyHtml === 'string' ? body.bodyHtml : ''

    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: 'Assunto e corpo HTML são obrigatórios' }, { status: 400 })
    }

    const prisma = getPrisma()
    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        bodyHtml,
        recipientFilter: body.recipientFilter || 'all_students',
        status: 'draft',
      },
    })

    return NextResponse.json({ campaign })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Erro' }, { status: err?.statusCode || 500 })
  }
}
