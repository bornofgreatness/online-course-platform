import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import { getPrisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    const prisma = getPrisma()
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: err?.statusCode || 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
    if (!code || code.length < 3) {
      return NextResponse.json({ error: 'Código do cupom obrigatório (mín. 3 caracteres)' }, { status: 400 })
    }

    const discountPercent =
      body.discountPercent != null ? Number(body.discountPercent) : null
    const discountCents = body.discountCents != null ? Number(body.discountCents) : null

    if ((discountPercent == null || discountPercent <= 0) && (discountCents == null || discountCents <= 0)) {
      return NextResponse.json({ error: 'Informe desconto em % ou valor fixo (centavos)' }, { status: 400 })
    }

    const prisma = getPrisma()
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: body.description || null,
        discountPercent: discountPercent && discountPercent > 0 ? Math.min(100, discountPercent) : null,
        discountCents: discountCents && discountCents > 0 ? Math.round(discountCents) : null,
        maxUses: body.maxUses != null ? Number(body.maxUses) : null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        active: body.active !== false,
      },
    })

    return NextResponse.json({ coupon })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Erro ao criar cupom' }, { status: err?.statusCode || 500 })
  }
}
