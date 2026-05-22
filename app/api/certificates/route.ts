import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '../../../lib/auth/session'
import { canDownloadCertificates } from '../../../lib/auth/rbac'
import {
  certificatePaymentRequiredResponse,
  isCertificateFeeRequired,
} from '../../../lib/assertCertificateFee'
import { getPrisma } from '../../../lib/prisma'
import { getActiveSubscription } from '../../../lib/subscription'
import { hasPaidCertificateFee } from '../../../lib/certificatePayment'
import { issueCertificate } from '../../../lib/issueCertificate'

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

    if (
      isCertificateFeeRequired(user.role) &&
      !(await hasPaidCertificateFee(prisma, user.id, courseId))
    ) {
      return NextResponse.json(certificatePaymentRequiredResponse(), { status: 402 })
    }

    const result = await issueCertificate(prisma, user.id, courseId, user.role)
    if (!result.ok) {
      if (result.status === 402) {
        return NextResponse.json(certificatePaymentRequiredResponse(), { status: 402 })
      }
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ certificate: result.certificate })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function GET(request: Request) {
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
