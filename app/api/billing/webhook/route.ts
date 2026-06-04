import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPrisma } from '../../../../lib/prisma'
import { activateSubscription } from '../../../../lib/activateSubscription'
import { isBillingPlan } from '../../../../lib/billingPlans'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !whSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripe = new Stripe(secret)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid signature'
    console.error('Stripe webhook signature error', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session.metadata?.userId
  const prisma = getPrisma()
  const amountBrl = (session.amount_total ?? 0) / 100

  if (session.metadata?.type === 'certificate') {
    const courseId = session.metadata?.courseId
    if (!userId || !courseId) {
      console.warn('certificate checkout missing metadata', session.id)
      return NextResponse.json({ received: true })
    }
    try {
      const { recordCertificatePayment } = await import('../../../../lib/certificatePayment')
      const { issueCertificate } = await import('../../../../lib/issueCertificate')
      await recordCertificatePayment(prisma, {
        userId,
        courseId,
        amountBrl,
        externalId: session.id,
        provider: 'stripe',
        currency: session.currency || 'brl',
      })
      const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
      await issueCertificate(prisma, userId, courseId, dbUser?.role)
    } catch (e) {
      console.error('certificate webhook failed', e)
    }
    return NextResponse.json({ received: true })
  }

  const plan = session.metadata?.plan
  const couponId = session.metadata?.couponId || undefined

  if (!userId || !plan || !isBillingPlan(plan)) {
    console.warn('checkout.session.completed missing metadata', session.id)
    return NextResponse.json({ received: true })
  }

  try {
    await activateSubscription(prisma, {
      userId,
      plan,
      amountBrl,
      currency: session.currency || 'brl',
      provider: 'stripe',
      externalId: session.id,
      couponId: couponId || null,
    })
  } catch (e) {
    console.error('activateSubscription failed', e)
  }

  return NextResponse.json({ received: true })
}
