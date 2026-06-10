import type { PrismaClient } from '@prisma/client'
import { assertCertificateFeePaid } from './assertCertificateFee'

export type IssueCertificateResult =
  | { ok: true; certificate: Awaited<ReturnType<typeof createCertificateRecord>> }
  | { ok: false; error: string; status: number }

async function createCertificateRecord(
  prisma: PrismaClient,
  userId: string,
  courseId: string
) {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.course.findUnique({ where: { id: courseId }, select: { title: true, workloadHours: true } }),
  ])

  if (!user || !course) {
    throw new Error('User or course not found')
  }

  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
  const pdfPath = `/api/certificates/pdf/${encodeURIComponent(certificateNumber)}`
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  const verifyUrl = `${base}/verify/certificate/${encodeURIComponent(certificateNumber)}`

  return prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber,
      pdfUrl: pdfPath,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`,
      holderName: user.name,
      courseTitle: course.title,
      workloadHours: course.workloadHours,
    },
  })
}

export async function userPassedCourseQuiz(
  prisma: PrismaClient,
  userId: string,
  courseId: string
) {
  const quiz = await prisma.quiz.findUnique({ where: { courseId } })
  if (!quiz) return true
  const passed = await prisma.quizAttempt.findFirst({
    where: { userId, quizId: quiz.id, passed: true },
  })
  return !!passed
}

export async function assertEligibleForCertificate(
  prisma: PrismaClient,
  userId: string,
  courseId: string
): Promise<{ ok: true; enrollment: { progress: string | null } } | { ok: false; error: string; status: number }> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })

  if (!enrollment) {
    return { ok: false, error: 'Not enrolled in this course', status: 404 }
  }

  const progress = enrollment.progress ? JSON.parse(enrollment.progress) : { completed: false }
  if (!progress.completed) {
    return { ok: false, error: 'Course not completed yet', status: 400 }
  }

  const okQuiz = await userPassedCourseQuiz(prisma, userId, courseId)
  if (!okQuiz) {
    return { ok: false, error: 'Pass the course quiz before requesting a certificate.', status: 400 }
  }

  return { ok: true, enrollment }
}

export async function issueCertificate(
  prisma: PrismaClient,
  userId: string,
  courseId: string,
  role?: string | null
): Promise<IssueCertificateResult> {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (existing) {
    return { ok: true, certificate: existing }
  }

  try {
    await assertCertificateFeePaid(prisma, userId, courseId, role)
  } catch (e: unknown) {
    const err = e as { message?: string; status?: number }
    return {
      ok: false,
      error: err.message || 'Certificate issuance fee not paid',
      status: err.status || 402,
    }
  }

  const eligible = await assertEligibleForCertificate(prisma, userId, courseId)
  if (!eligible.ok) {
    return { ok: false, error: eligible.error, status: eligible.status }
  }

  const certificate = await createCertificateRecord(prisma, userId, courseId)
  return { ok: true, certificate }
}
