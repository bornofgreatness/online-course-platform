import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { activateSubscription } from '../../../../../lib/activateSubscription'
import { isBillingPlan } from '../../../../../lib/billingPlans'

export const dynamic = 'force-dynamic'

/**
 * Confirms a completed Checkout Session and activates the subscription.
 * Use after redirect from Stripe (works without webhooks — ideal for local dev).
 * Webhooks remain the source of truth in production.
 */
export async function GET(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const sessionId = new URL(request.url).searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
  }

  const stripe = new Stripe(secret)
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

  const userId = checkout.metadata?.userId
  const plan = checkout.metadata?.plan
  const couponId = checkout.metadata?.couponId || undefined

  if (!userId || !plan || !isBillingPlan(plan)) {
    return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
  }

  const sessionUserId = (session.user as { id?: string }).id
  if (sessionUserId && sessionUserId !== userId) {
    return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 })
  }

  const prisma = getPrisma()
  const amountBrl = (checkout.amount_total ?? 0) / 100

  try {
    await activateSubscription(prisma, {
      userId,
      plan,
      amountBrl,
      currency: checkout.currency || 'brl',
      provider: 'stripe',
      externalId: checkout.id,
      couponId: couponId || null,
    })
  } catch (e) {
    console.error('stripe confirm activateSubscription', e)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  const active = await prisma.subscription.findFirst({
    where: { userId, active: true },
    orderBy: { endDate: 'desc' },
  })

  return NextResponse.json({
    ok: true,
    plan,
    subscription: active
      ? { plan: active.plan, endDate: active.endDate, active: active.active }
      : null,
  })
}
