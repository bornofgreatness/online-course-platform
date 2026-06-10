import { NextResponse } from 'next/server'
import { authErrorResponse, requireSession } from '@/lib/auth/session'
import { canDownloadCertificates } from '@/lib/auth/rbac'
import { buildCertificatePdf } from '../../../../../lib/buildCertificatePdf'
import { getCertificateIssuanceLocation } from '../../../../../lib/certificateSettings'
import { getPrisma } from '../../../../../lib/prisma'
import { getActiveSubscription } from '../../../../../lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { certificateNumber: string } }
) {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)

    if (!canDownloadCertificates(user.role, !!sub)) {
      return NextResponse.json({ error: 'Subscription required to download certificates' }, { status: 403 })
    }

    const certificateNumber = decodeURIComponent(params.certificateNumber)
    if (!certificateNumber) {
      return NextResponse.json({ error: 'Invalid certificate' }, { status: 400 })
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        certificateNumber,
        userId: user.id,
      },
      include: {
        course: { select: { title: true, workloadHours: true } },
        user: { select: { name: true, email: true } },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const issuanceLocation = await getCertificateIssuanceLocation(prisma)

    const pdfBytes = await buildCertificatePdf({
      holderName: certificate.holderName || certificate.user.name,
      courseTitle: certificate.courseTitle || certificate.course.title,
      workloadHours: certificate.workloadHours ?? certificate.course.workloadHours ?? 100,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      holderEmail: certificate.user.email,
      issuanceCity: issuanceLocation.city,
      issuanceState: issuanceLocation.state,
    })

    const filename = `certificate-${certificate.certificateNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
