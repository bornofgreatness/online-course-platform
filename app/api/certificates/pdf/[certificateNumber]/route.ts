import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { authErrorResponse, requireSession } from '@/lib/auth/session'
import { canDownloadCertificates } from '@/lib/auth/rbac'
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
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const margin = 56
    let y = 720

    const hours = certificate.course.workloadHours || 100
    const issuedDate = certificate.issuedAt.toLocaleDateString('pt-BR')

    page.drawText('Certificado de Conclusao', {
      x: margin,
      y,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.35),
    })
    y -= 28

    page.drawText(`Carga horaria: ${hours} horas`, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    })
    y -= 36

    page.drawText(certificate.course.title, {
      x: margin,
      y,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 500,
      lineHeight: 20,
    })
    y -= 56

    page.drawText(`Certificamos que: ${user.name}`, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    })
    y -= 22

    page.drawText(`Email: ${user.email}`, {
      x: margin,
      y,
      size: 11,
      font,
      color: rgb(0.35, 0.35, 0.35),
    })
    y -= 36

    page.drawText(`Codigo de verificacao: ${certificate.certificateNumber}`, {
      x: margin,
      y,
      size: 11,
      font,
      color: rgb(0.25, 0.25, 0.25),
    })
    y -= 20

    page.drawText(`Data de conclusao: ${issuedDate}`, {
      x: margin,
      y,
      size: 11,
      font,
      color: rgb(0.25, 0.25, 0.25),
    })

    const pdfBytes = await pdfDoc.save()
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
