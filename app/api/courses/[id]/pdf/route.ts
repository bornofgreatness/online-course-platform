import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { getActiveSubscription, isPrivilegedRole } from '../../../../../lib/subscription'
import { touchLastViewed, parseCourseProgress } from '../../../../../lib/progress'

export const dynamic = 'force-dynamic'

/** Authenticated PDF delivery — blocks direct hotlinking of course.pdfUrl. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course?.pdfUrl) {
    return NextResponse.json({ error: 'Course material not found' }, { status: 404 })
  }

  const role = (user.role ?? '').toString()
  if (!isPrivilegedRole(role)) {
    const sub = await getActiveSubscription(prisma, user.id)
    if (!sub) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: params.id } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  const progress = touchLastViewed(parseCourseProgress(enrollment.progress))
  await prisma.enrollment.update({
    where: { userId_courseId: { userId: user.id, courseId: params.id } },
    data: { progress: JSON.stringify(progress) },
  })

  const target = course.pdfUrl.trim()
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid material URL' }, { status: 500 })
  }

  const res = NextResponse.redirect(target, 302)
  res.headers.set('Cache-Control', 'private, no-store')
  return res
}
