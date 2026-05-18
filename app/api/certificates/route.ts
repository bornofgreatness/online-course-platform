import { NextResponse } from 'next/server'
import { authErrorResponse, requirePremiumAccess, requireSession } from '@/lib/auth/session'
import { canDownloadCertificates } from '@/lib/auth/rbac'
import { getPrisma } from '../../../lib/prisma'
import { getActiveSubscription } from '../../../lib/subscription'

async function userPassedCourseQuiz(prisma: ReturnType<typeof getPrisma>, userId: string, courseId: string) {
  const quiz = await prisma.quiz.findUnique({ where: { courseId } })
  if (!quiz) return true
  const passed = await prisma.quizAttempt.findFirst({
    where: { userId, quizId: quiz.id, passed: true },
  })
  return !!passed
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)

    if (!canDownloadCertificates(user.role, !!sub)) {
      return NextResponse.json(
        { error: 'An active subscription is required to request certificates.' },
        { status: 403 }
      )
    }

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      include: { course: true },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })
    }

    const progress = enrollment.progress ? JSON.parse(enrollment.progress) : { completed: false }
    if (!progress.completed) {
      return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 })
    }

    const okQuiz = await userPassedCourseQuiz(prisma, user.id, courseId)
    if (!okQuiz) {
      return NextResponse.json({ error: 'Pass the course quiz before requesting a certificate.' }, { status: 400 })
    }

    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (existingCertificate) {
      return NextResponse.json({ certificate: existingCertificate })
    }

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const pdfPath = `/api/certificates/pdf/${encodeURIComponent(certificateNumber)}`
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      'http://localhost:3000'
    const verifyUrl = `${base}/verify/certificate/${encodeURIComponent(certificateNumber)}`

    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseId,
        certificateNumber,
        pdfUrl: pdfPath,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`,
      },
    })

    return NextResponse.json({ certificate })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function GET() {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)

    if (!canDownloadCertificates(user.role, !!sub)) {
      return NextResponse.json({ certificates: [] })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json({ certificates })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
