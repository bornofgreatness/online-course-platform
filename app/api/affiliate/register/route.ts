import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '@/lib/auth/session'
import { canRegisterAsAffiliate } from '@/lib/auth/rbac'
import { getPrisma } from '@/lib/prisma'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { user } = await requireSession()

    if (!canRegisterAsAffiliate(user.role)) {
      return NextResponse.json({ error: 'Administrators cannot register as affiliates' }, { status: 400 })
    }

    const prisma = getPrisma()
    const existing = await prisma.affiliate.findUnique({ where: { userId: user.id } })
    if (existing) {
      return NextResponse.json({ affiliate: existing })
    }

    let referralCode = randomCode()
    for (let i = 0; i < 5; i++) {
      const clash = await prisma.affiliate.findUnique({ where: { referralCode } })
      if (!clash) break
      referralCode = randomCode()
    }

    const affiliate = await prisma.affiliate.create({
      data: { userId: user.id, referralCode },
    })

    return NextResponse.json({ affiliate })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
