import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '@/lib/auth/session'
import { getPrisma } from '../../../lib/prisma'
import { parseCourseProgress, progressSortKey } from '../../../lib/progress'

export async function GET() {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()

    const [enrollmentsRaw, subscriptions, payments, certificates] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
          course: {
            include: { category: true },
          },
        },
      }),
      prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.findMany({
        where: { userId: user.id },
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
      }),
    ])

    const enrollments = [...enrollmentsRaw].sort(
      (a, b) => progressSortKey(b.progress, b.enrolledAt) - progressSortKey(a.progress, a.enrolledAt)
    )

    const now = new Date()
    const activeSubscription =
      subscriptions.find((s: { active: boolean; endDate: Date }) => s.active && s.endDate > now) || null

    const totalCompleted = enrollments.filter((e) => parseCourseProgress(e.progress).completed).length
    const completionPercent = enrollments.length === 0 ? 0 : Math.round((totalCompleted / enrollments.length) * 100)

    const recentlyViewed = enrollments
      .filter((e) => parseCourseProgress(e.progress).lastViewedAt)
      .slice(0, 5)
      .map((e) => ({
        courseId: e.courseId,
        title: e.course.title,
        lastViewedAt: parseCourseProgress(e.progress).lastViewedAt,
      }))

    return NextResponse.json({
      enrollments,
      recentlyViewed,
      subscriptions,
      activeSubscription,
      payments,
      certificates,
      completionPercent,
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
