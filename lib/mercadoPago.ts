import type { BillingPlan } from './billingPlans'
import { PLAN_LABEL_PT, PLAN_MONTHS } from './billingPlans'

const MP_API = 'https://api.mercadopago.com'

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
  return token
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN)
}

export type MercadoPagoPreferenceInput = {
  plan: BillingPlan
  title: string
  unitPriceBrl: number
  userId: string
  payerEmail: string
  couponId?: string
  baseUrl: string
}

export async function createMercadoPagoPreference(input: MercadoPagoPreferenceInput) {
  const token = accessToken()
  const months = PLAN_MONTHS[input.plan]
  const externalReference = [input.userId, input.plan, input.couponId || ''].join(':')

  const body = {
    items: [
      {
        id: input.plan,
        title: input.title || `Plataforma — ${PLAN_LABEL_PT[input.plan]}`,
        description: `${months} mês(es) — acesso completo`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: input.unitPriceBrl,
      },
    ],
    payer: { email: input.payerEmail },
    payment_methods: {
      installments: 12,
      default_installments: 1,
    },
    back_urls: {
      success: `${input.baseUrl}/dashboard?checkout=success&provider=mercadopago`,
      failure: `${input.baseUrl}/pricing?checkout=failed`,
      pending: `${input.baseUrl}/dashboard?checkout=pending&provider=mercadopago`,
    },
    auto_return: 'approved',
    external_reference: externalReference,
    notification_url: `${input.baseUrl}/api/billing/mercadopago/webhook`,
    metadata: {
      user_id: input.userId,
      plan: input.plan,
      coupon_id: input.couponId || '',
    },
  }

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Mercado Pago ${res.status}`)
  }

  return data as {
    id: string
    init_point: string
    sandbox_init_point?: string
  }
}

export async function getMercadoPagoPayment(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || `Payment fetch failed ${res.status}`)
  }
  return data as {
    id: number
    status: string
    transaction_amount: number
    currency_id: string
    external_reference?: string
    metadata?: { user_id?: string; plan?: string; coupon_id?: string }
  }
}

export function parseExternalReference(ref?: string) {
  if (!ref) return null
  const [userId, plan, couponId] = ref.split(':')
  if (!userId || !plan) return null
  return { userId, plan, couponId: couponId || undefined }
}
