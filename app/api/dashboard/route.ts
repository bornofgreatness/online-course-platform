import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { getPrisma } from '../../../lib/prisma'

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

  const [enrollments, subscriptions, payments, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: { category: true }
        }
      },
      orderBy: { enrolledAt: 'desc' }
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

  const now = new Date()
  const activeSubscription = subscriptions.find((s: { active: boolean; endDate: Date }) => s.active && s.endDate > now) || null

  const totalCompleted = enrollments.filter((e: { progress: string | null }) => {
    if (!e.progress) return false
    try {
      const p = JSON.parse(e.progress)
      return !!p.completed
    } catch {
      return false
    }
  }).length

  const completionPercent = enrollments.length === 0 ? 0 : Math.round((totalCompleted / enrollments.length) * 100)

  return NextResponse.json({
    enrollments,
    subscriptions,
    activeSubscription,
    payments,
    certificates,
    completionPercent
  })
}

