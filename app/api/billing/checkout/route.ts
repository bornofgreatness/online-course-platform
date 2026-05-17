import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '../../auth/[...nextauth]/options'
import { PLAN_LABEL_PT, PLAN_MONTHS } from '../../../../lib/billingPlans'
import { resolveCheckoutPricing } from '../../../../lib/billingCheckout'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe não configurado (STRIPE_SECRET_KEY).' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const plan = typeof body?.plan === 'string' ? body.plan : ''
  const couponCode = typeof body?.couponCode === 'string' ? body.couponCode : undefined

  try {
    const pricing = await resolveCheckoutPricing(plan, couponCode)
    const stripe = new Stripe(secret)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário ausente na sessão' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'boleto'],
      customer_email: session.user.email,
      locale: 'pt-BR',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'brl',
            unit_amount: pricing.finalCents,
            product_data: {
              name: `Plataforma de Cursos — ${PLAN_LABEL_PT[pricing.plan]}`,
              description: `${PLAN_MONTHS[pricing.plan]} mês(es) de acesso a todo o catálogo`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        userId,
        plan: pricing.plan,
        couponId: pricing.couponId || '',
      },
    })

    return NextResponse.json({ url: checkoutSession.url, provider: 'stripe' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Falha no checkout'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
