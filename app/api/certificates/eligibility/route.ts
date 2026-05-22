import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '../../../../lib/auth/session'
import { canDownloadCertificates } from '../../../../lib/auth/rbac'
import {
  certificateFeeWaivedForRole,
  isCertificateFeeRequired,
} from '../../../../lib/assertCertificateFee'
import { CERTIFICATE_ISSUANCE_FEE_CENTS, formatCertificateFeeBrl } from '../../../../lib/certificatePolicy'
import { getPrisma } from '../../../../lib/prisma'
import { getActiveSubscription } from '../../../../lib/subscription'
import { hasPaidCertificateFee } from '../../../../lib/certificatePayment'
import { assertEligibleForCertificate, userPassedCourseQuiz } from '../../../../lib/issueCertificate'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { user } = await requireSession()
    const courseId = new URL(request.url).searchParams.get('courseId')?.trim()
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)

    if (!canDownloadCertificates(user.role, !!sub)) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const certificate = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    })
    if (certificate) {
      return NextResponse.json({
        hasCertificate: true,
        certificate,
        feeRequired: false,
        paymentRequired: false,
      })
    }

    const eligible = await assertEligibleForCertificate(prisma, user.id, courseId)
    const feeRequired = isCertificateFeeRequired(user.role)
    const feePaid = feeRequired ? await hasPaidCertificateFee(prisma, user.id, courseId) : true
    const paymentRequired = feeRequired && !feePaid

    return NextResponse.json({
      hasCertificate: false,
      eligible: eligible.ok,
      eligibilityError: eligible.ok ? null : eligible.error,
      courseCompleted: eligible.ok,
      quizPassed: eligible.ok ? true : await userPassedCourseQuiz(prisma, user.id, courseId),
      feeRequired,
      feePaid,
      feeWaived: certificateFeeWaivedForRole(user.role),
      paymentRequired,
      feeCents: CERTIFICATE_ISSUANCE_FEE_CENTS,
      feeLabel: formatCertificateFeeBrl(),
      checkoutEndpoint: paymentRequired ? '/api/billing/certificate-checkout' : null,
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
