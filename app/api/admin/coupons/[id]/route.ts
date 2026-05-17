import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/auth/admin'
import { getPrisma } from '../../../../../lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const prisma = getPrisma()

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        active: typeof body.active === 'boolean' ? body.active : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        maxUses: body.maxUses != null ? Number(body.maxUses) : undefined,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      },
    })

    return NextResponse.json({ coupon })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Erro' }, { status: err?.statusCode || 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const prisma = getPrisma()
    await prisma.coupon.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number }
    return NextResponse.json({ error: err?.message || 'Erro' }, { status: err?.statusCode || 500 })
  }
}
