import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { getPrisma } from '../../../lib/prisma'
import { parseCourseProgress, progressSortKey } from '../../../lib/progress'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const [enrollmentsRaw, subscriptions, payments, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: { category: true }
        }
      },
    }),
    prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { issuedAt: 'desc' }
    })
  ])

  const enrollments = [...enrollmentsRaw].sort(
    (a, b) => progressSortKey(b.progress, b.enrolledAt) - progressSortKey(a.progress, a.enrolledAt)
  )

  const now = new Date()
  const activeSubscription = subscriptions.find((s: { active: boolean; endDate: Date }) => s.active && s.endDate > now) || null

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
    completionPercent
  })
}

