import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { issueCertificate } from '../../../../../lib/issueCertificate'
import { recordCertificatePayment } from '../../../../../lib/certificatePayment'
import {
  getMercadoPagoPayment,
  parseCertificateExternalReference,
  isMercadoPagoConfigured,
} from '../../../../../lib/mercadoPago'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const url = new URL(request.url)
  const courseId = url.searchParams.get('courseId')
  const paymentId = url.searchParams.get('payment_id')

  if (!courseId || !paymentId) {
    return NextResponse.json({ error: 'courseId and payment_id are required' }, { status: 400 })
  }

  const sessionUserId = (session.user as { id?: string }).id
  if (!sessionUserId) {
    return NextResponse.json({ error: 'User id missing in session' }, { status: 400 })
  }

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: 'Mercado Pago not configured' }, { status: 503 })
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId)
    if (payment.status !== 'approved') {
      return NextResponse.json(
        { error: 'Payment not completed', paymentStatus: payment.status },
        { status: 400 }
      )
    }

    const parsed =
      parseCertificateExternalReference(payment.external_reference) ||
      (payment.metadata?.user_id && payment.metadata?.course_id
        ? { userId: payment.metadata.user_id, courseId: payment.metadata.course_id }
        : null)

    if (!parsed || parsed.courseId !== courseId) {
      return NextResponse.json({ error: 'Invalid payment reference' }, { status: 400 })
    }

    if (parsed.userId !== sessionUserId) {
      return NextResponse.json({ error: 'Payment does not belong to this user' }, { status: 403 })
    }

    const prisma = getPrisma()
    await recordCertificatePayment(prisma, {
      userId: parsed.userId,
      courseId: parsed.courseId,
      amountBrl: payment.transaction_amount,
      externalId: String(payment.id),
      provider: 'mercadopago',
      currency: payment.currency_id?.toLowerCase() || 'brl',
    })

    const dbUser = await prisma.user.findUnique({ where: { id: parsed.userId }, select: { role: true } })
    const result = await issueCertificate(prisma, parsed.userId, parsed.courseId, dbUser?.role)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      ok: true,
      certificate: result.certificate,
    })
  } catch (e) {
    console.error('certificate confirm', e)
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 })
  }
}
