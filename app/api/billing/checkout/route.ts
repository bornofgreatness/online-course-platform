import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '../../auth/[...nextauth]/options'
import { isBillingPlan, PLAN_AMOUNT_CENTS, PLAN_LABEL, PLAN_MONTHS } from '../../../../lib/billingPlans'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const plan = typeof body?.plan === 'string' ? body.plan : ''
  if (!isBillingPlan(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const stripe = new Stripe(secret)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'

  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id in session' }, { status: 400 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: session.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PLAN_AMOUNT_CENTS[plan],
          product_data: {
            name: `Course platform — ${PLAN_LABEL[plan]}`,
            description: `${PLAN_MONTHS[plan]} month(s) of full catalog access`,
          },
        },
      },
    ],
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: {
      userId,
      plan,
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
