import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth/admin'
import { getPrisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      totalUsers: 0,
      revenueUsd: 0,
      activeSubscriptions: 0,
      totalEnrollments: 0,
      completedEnrollments: 0,
      affiliateReferrals: 0,
      pendingCommissionUsd: 0,
    })
  }

  const prisma = getPrisma()
  const now = new Date()

  const [
    totalUsers,
    paymentsAgg,
    activeSubscriptions,
    totalEnrollments,
    enrollments,
    affiliateReferrals,
    pendingCommissionsAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.payment.aggregate({ where: { status: 'succeeded' }, _sum: { amount: true } }),
    prisma.subscription.count({ where: { active: true, endDate: { gt: now } } }),
    prisma.enrollment.count(),
    prisma.enrollment.findMany({ select: { progress: true } }),
    prisma.referral.count(),
    prisma.affiliateCommission.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
  ])

  let completedEnrollments = 0
  for (const e of enrollments) {
    if (!e.progress) continue
    try {
      const p = JSON.parse(e.progress)
      if (p?.completed) completedEnrollments++
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    totalUsers,
    revenueUsd: paymentsAgg._sum.amount ?? 0,
    activeSubscriptions,
    totalEnrollments,
    completedEnrollments,
    completionRatePercent:
      totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 1000) / 10,
    affiliateReferrals,
    pendingCommissionUsd: pendingCommissionsAgg._sum.amount ?? 0,
  })
}
