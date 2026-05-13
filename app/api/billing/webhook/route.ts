import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPrisma } from '../../../../lib/prisma'
import { addMonths, isBillingPlan, PLAN_MONTHS, type BillingPlan } from '../../../../lib/billingPlans'

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
  } catch (e: any) {
    console.error('Stripe webhook signature error', e?.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan
  if (!userId || !plan || !isBillingPlan(plan)) {
    console.warn('checkout.session.completed missing metadata', session.id)
    return NextResponse.json({ received: true })
  }

  const prisma = getPrisma()
  const months = PLAN_MONTHS[plan as BillingPlan]
  const amountUsd = (session.amount_total ?? 0) / 100

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { userId, active: true },
      data: { active: false },
    })

    const start = new Date()
    const end = addMonths(start, months)
    await tx.subscription.create({
      data: {
        userId,
        plan,
        startDate: start,
        endDate: end,
        active: true,
      },
    })

    await tx.payment.create({
      data: {
        userId,
        amount: amountUsd,
        currency: (session.currency || 'usd').toLowerCase(),
        status: 'succeeded',
        stripeId: session.id,
      },
    })

    const referral = await tx.referral.findFirst({
      where: { referredUserId: userId },
      orderBy: { createdAt: 'desc' },
    })
    if (referral && amountUsd > 0) {
      const commission = Math.round(amountUsd * 10) / 100
      if (commission > 0) {
        await tx.affiliateCommission.create({
          data: {
            affiliateId: referral.affiliateId,
            referredUserId: userId,
            amount: commission,
            status: 'PENDING',
          },
        })
      }
    }
  })

  return NextResponse.json({ received: true })
}
