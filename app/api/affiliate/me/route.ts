import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: user.id },
    include: {
      commissions: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!affiliate) {
    return NextResponse.json({ affiliate: null })
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    ''

  const referralLink = base ? `${base}/auth/signup?ref=${encodeURIComponent(affiliate.referralCode)}` : null

  const [referralCount, paidAgg, pendingAgg] = await Promise.all([
    prisma.referral.count({ where: { affiliateId: affiliate.id } }),
    prisma.affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id, status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.affiliateCommission.aggregate({
      where: { affiliateId: affiliate.id, status: 'PENDING' },
      _sum: { amount: true },
    }),
  ])

  const paid = paidAgg._sum.amount ?? 0
  const pending = pendingAgg._sum.amount ?? 0

  return NextResponse.json({
    affiliate: {
      id: affiliate.id,
      referralCode: affiliate.referralCode,
      referralLink,
      referralCount,
      commissionsPaid: paid,
      commissionsPending: pending,
      recentCommissions: affiliate.commissions,
    },
  })
}
