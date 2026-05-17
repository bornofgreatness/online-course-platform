import { NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'
import { requireAdmin } from '../../../../lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode ?? 403
    return NextResponse.json({ error: 'Forbidden' }, { status })
  }

  const prisma = getPrisma()
  const commissions = await prisma.affiliateCommission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      affiliate: { include: { user: { select: { name: true, email: true } } } },
      referredUser: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json({ commissions })
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode ?? 403
    return NextResponse.json({ error: 'Forbidden' }, { status })
  }

  const body = await request.json().catch(() => ({}))
  const { id, status } = body as { id?: string; status?: string }
  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  const normalized = status.toUpperCase()
  if (normalized !== 'PAID' && normalized !== 'PENDING' && normalized !== 'REJECTED') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const prisma = getPrisma()
  const updated = await prisma.affiliateCommission.update({
    where: { id },
    data: { status: normalized },
  })

  return NextResponse.json({ commission: updated })
}
