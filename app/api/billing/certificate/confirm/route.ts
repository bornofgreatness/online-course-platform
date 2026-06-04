import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '../../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { issueCertificate } from '../../../../../lib/issueCertificate'
import { recordCertificatePayment } from '../../../../../lib/certificatePayment'
import { getMercadoPagoPayment, parseCertificateExternalReference } from '../../../../../lib/mercadoPago'
import { isMercadoPagoConfigured, isStripeConfigured } from '../../../../../lib/billingProvider'

export const dynamic = 'force-dynamic'

async function confirmAndIssue(
  userId: string,
  courseId: string,
  amountBrl: number,
  externalId: string,
  provider: 'stripe' | 'mercadopago',
  currency = 'brl'
) {
  const prisma = getPrisma()
  await recordCertificatePayment(prisma, {
    userId,
    courseId,
    amountBrl,
    externalId,
    provider,
    currency,
  })

  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  const result = await issueCertificate(prisma, userId, courseId, dbUser?.role)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({
    ok: true,
    certificate: result.certificate,
  })
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const url = new URL(request.url)
  const courseId = url.searchParams.get('courseId')
  const sessionId = url.searchParams.get('session_id')
  const paymentId = url.searchParams.get('payment_id')

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const sessionUserId = (session.user as { id?: string }).id
  if (!sessionUserId) {
    return NextResponse.json({ error: 'User id missing in session' }, { status: 400 })
  }

  try {
    if (paymentId) {
      if (!isMercadoPagoConfigured()) {
        return NextResponse.json({ error: 'Mercado Pago not configured' }, { status: 503 })
      }

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

      return confirmAndIssue(
        parsed.userId,
        parsed.courseId,
        payment.transaction_amount,
        String(payment.id),
        'mercadopago',
        payment.currency_id?.toLowerCase() || 'brl'
      )
    }

    if (sessionId) {
      if (!isStripeConfigured()) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim())
      let checkout: Stripe.Checkout.Session
      try {
        checkout = await stripe.checkout.sessions.retrieve(sessionId)
      } catch {
        return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 })
      }

      if (checkout.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed', paymentStatus: checkout.payment_status },
          { status: 400 }
        )
      }

      if (checkout.metadata?.type !== 'certificate') {
        return NextResponse.json({ error: 'Not a certificate payment session' }, { status: 400 })
      }

      const userId = checkout.metadata?.userId
      const metaCourseId = checkout.metadata?.courseId
      if (!userId || metaCourseId !== courseId) {
        return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
      }

      if (userId !== sessionUserId) {
        return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 })
      }

      const amountBrl = (checkout.amount_total ?? 0) / 100
      return confirmAndIssue(userId, courseId, amountBrl, checkout.id, 'stripe', checkout.currency || 'brl')
    }

    return NextResponse.json({ error: 'session_id or payment_id is required' }, { status: 400 })
  } catch (e) {
    console.error('certificate confirm', e)
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 })
  }
}
