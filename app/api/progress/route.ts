import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import { getPrisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { courseId, progress } = await request.json()
  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    }
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })
  }

  await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    },
    data: {
      progress: JSON.stringify(progress)
    }
  })

  return NextResponse.json({ success: true })
}
