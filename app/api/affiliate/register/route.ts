import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../lib/prisma'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const role = (user.role ?? '').toString().toUpperCase()
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Administrators cannot register as affiliates' }, { status: 400 })
  }

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

  const affiliate = await prisma.$transaction(async (tx) => {
    const a = await tx.affiliate.create({
      data: { userId: user.id, referralCode },
    })
    await tx.user.update({
      where: { id: user.id },
      data: { role: 'AFFILIATE' },
    })
    return a
  })

  return NextResponse.json({ affiliate })
}
