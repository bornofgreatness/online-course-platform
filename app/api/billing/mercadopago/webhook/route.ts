import { NextResponse } from 'next/server'
import { getPrisma } from '../../../../../lib/prisma'
import { activateSubscription } from '../../../../../lib/activateSubscription'
import { getMercadoPagoPayment, parseExternalReference, isMercadoPagoConfigured } from '../../../../../lib/mercadoPago'
import { isBillingPlan } from '../../../../../lib/billingPlans'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const topic = request.headers.get('x-topic') || body?.type || body?.action
  const paymentId =
    body?.data?.id?.toString() ||
    (body?.type === 'payment' ? body?.data?.id?.toString() : null) ||
    (typeof body?.id === 'string' || typeof body?.id === 'number' ? String(body.id) : null)

  if (!paymentId) {
    return NextResponse.json({ received: true })
  }

  if (topic && !String(topic).includes('payment') && body?.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId)
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true, status: payment.status })
    }

    const parsed =
      parseExternalReference(payment.external_reference) ||
      (payment.metadata?.user_id && payment.metadata?.plan
        ? {
            userId: payment.metadata.user_id,
            plan: payment.metadata.plan,
            couponId: payment.metadata.coupon_id || undefined,
          }
        : null)

    if (!parsed || !isBillingPlan(parsed.plan)) {
      console.warn('MP webhook: missing reference', paymentId)
      return NextResponse.json({ received: true })
    }

    const prisma = getPrisma()
    await activateSubscription(prisma, {
      userId: parsed.userId,
      plan: parsed.plan,
      amountBrl: payment.transaction_amount,
      currency: payment.currency_id?.toLowerCase() || 'brl',
      provider: 'mercadopago',
      externalId: String(payment.id),
      couponId: parsed.couponId || null,
    })

    return NextResponse.json({ received: true, activated: true })
  } catch (e) {
    console.error('Mercado Pago webhook error', e)
    return NextResponse.json({ received: true })
  }
}
