import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { createMercadoPagoPreference, isMercadoPagoConfigured } from '../../../../../lib/mercadoPago'
import { resolveCheckoutPricing } from '../../../../../lib/billingCheckout'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ error: 'Mercado Pago não configurado (MERCADOPAGO_ACCESS_TOKEN).' }, { status: 503 })
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
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário ausente na sessão' }, { status: 400 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'

    const preference = await createMercadoPagoPreference({
      plan: pricing.plan,
      title: pricing.title,
      unitPriceBrl: pricing.finalBrl,
      userId,
      payerEmail: session.user.email,
      couponId: pricing.couponId,
      baseUrl,
    })

    const useSandbox = process.env.MERCADOPAGO_SANDBOX === 'true'
    const url = useSandbox && preference.sandbox_init_point ? preference.sandbox_init_point : preference.init_point

    return NextResponse.json({ url, preferenceId: preference.id, provider: 'mercadopago' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Falha no checkout'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
