import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '../../../../lib/auth/session'
import { canDownloadCertificates } from '../../../../lib/auth/rbac'
import { certificateFeeWaivedForRole, isCertificateFeeRequired } from '../../../../lib/assertCertificateFee'
import { formatCertificateFeeBrl, CERTIFICATE_ISSUANCE_FEE_CENTS } from '../../../../lib/certificatePolicy'
import { hasPaidCertificateFee } from '../../../../lib/certificatePayment'
import { getPrisma } from '../../../../lib/prisma'
import { parseCourseProgress } from '../../../../lib/progress'
import { getActiveSubscription } from '../../../../lib/subscription'
import { userPassedCourseQuiz } from '../../../../lib/issueCertificate'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)
    const canAccess = canDownloadCertificates(user.role, !!sub)

    if (!canAccess) {
      return NextResponse.json({
        certificates: [],
        completedCourses: [],
        inProgressCourses: [],
        subscriptionRequired: true,
      })
    }

    const [certificates, enrollments] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId: user.id },
        include: {
          course: { select: { title: true, description: true, workloadHours: true } },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              workloadHours: true,
              thumbnailUrl: true,
              quiz: { select: { id: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
    ])

    const issuedCourseIds = new Set(certificates.map((c) => c.courseId))
    const feeRequired = isCertificateFeeRequired(user.role)
    const feeWaived = certificateFeeWaivedForRole(user.role)

    const completedCourses = []
    const inProgressCourses = []

    for (const enrollment of enrollments) {
      const progress = parseCourseProgress(enrollment.progress)
      const course = enrollment.course
      const progressPercent = progress.completed ? 100 : Math.min((progress.lastPage / 10) * 100, 90)

      if (!progress.completed) {
        inProgressCourses.push({
          courseId: course.id,
          title: course.title,
          description: course.description,
          workloadHours: course.workloadHours,
          thumbnailUrl: course.thumbnailUrl,
          progressPercent: Math.round(progressPercent),
          enrolledAt: enrollment.enrolledAt.toISOString(),
        })
        continue
      }

      if (issuedCourseIds.has(course.id)) continue

      const quizExists = !!course.quiz
      const quizPassed = await userPassedCourseQuiz(prisma, user.id, course.id)
      const feePaid = feeRequired ? await hasPaidCertificateFee(prisma, user.id, course.id) : true

      completedCourses.push({
        courseId: course.id,
        title: course.title,
        description: course.description,
        workloadHours: course.workloadHours,
        thumbnailUrl: course.thumbnailUrl,
        quizExists,
        quizPassed,
        feeRequired,
        feeWaived,
        feePaid,
        paymentRequired: feeRequired && !feePaid,
        eligible: quizPassed,
        feeCents: CERTIFICATE_ISSUANCE_FEE_CENTS,
        feeLabel: formatCertificateFeeBrl(),
      })
    }

    return NextResponse.json({
      certificates,
      completedCourses,
      inProgressCourses,
      subscriptionRequired: false,
      holderName: user.name,
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
