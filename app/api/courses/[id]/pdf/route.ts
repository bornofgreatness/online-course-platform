import { NextResponse } from 'next/server'
import { authErrorResponse, requirePremiumAccess, requireSession } from '@/lib/auth/session'
import { isS3Configured, s3ObjectKeyFromUrlOrKey, signedObjectUrl } from '@/lib/s3'
import { getPrisma } from '../../../../../lib/prisma'
import { touchLastViewed, parseCourseProgress } from '../../../../../lib/progress'

export const dynamic = 'force-dynamic'

/** Authenticated PDF delivery — blocks direct hotlinking of course.pdfUrl. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requirePremiumAccess()
    const { user } = await requireSession()

    const prisma = getPrisma()
    const course = await prisma.course.findUnique({ where: { id: params.id } })
    if (!course?.pdfUrl) {
      return NextResponse.json({ error: 'Course material not found' }, { status: 404 })
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
      if (!isS3Configured()) {
        return NextResponse.json({ error: 'Secure course storage is not configured' }, { status: 500 })
      }

      const signedUrl = await signedObjectUrl(target, {
        expiresInSeconds: 60 * 5,
        filename: `${course.title.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`,
      })
      const res = NextResponse.redirect(signedUrl, 302)
      res.headers.set('Cache-Control', 'private, no-store')
      return res
    }

    const s3Key = s3ObjectKeyFromUrlOrKey(target)
    if (s3Key && isS3Configured()) {
      const signedUrl = await signedObjectUrl(s3Key, {
        expiresInSeconds: 60 * 5,
        filename: `${course.title.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`,
      })
      const res = NextResponse.redirect(signedUrl, 302)
      res.headers.set('Cache-Control', 'private, no-store')
      return res
    }

    const res = NextResponse.redirect(target, 302)
    res.headers.set('Cache-Control', 'private, no-store')
    return res
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
