import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { getPrisma } from '../../../lib/prisma'
import { getActiveSubscription, isPrivilegedRole } from '../../../lib/subscription'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { courseId } = await request.json()
  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const role = (user.role ?? '').toString()
  if (!isPrivilegedRole(role)) {
    const sub = await getActiveSubscription(prisma, user.id)
    if (!sub) {
      return NextResponse.json(
        { error: 'An active subscription is required to enroll. Visit pricing to subscribe.' },
        { status: 403 }
      )
    }
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    }
  })

  if (existing) {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
  }

  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId,
      progress: JSON.stringify({ completed: false, lastPage: 0 })
    }
  })

  return NextResponse.json({ success: true })
}
