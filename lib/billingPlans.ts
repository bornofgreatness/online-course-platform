/** Plan keys sent from pricing UI and checkout metadata. */
export const BILLING_PLANS = ['1m', '3m', '6m', '1y'] as const
export type BillingPlan = (typeof BILLING_PLANS)[number]

export const PLAN_MONTHS: Record<BillingPlan, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '1y': 12,
}

/** Total plan price in BRL centavos (one-time checkout). */
export const PLAN_TOTAL_CENTS_BRL: Record<BillingPlan, number> = {
  '1m': 2990,
  '3m': 4500,
  '6m': 7800,
  '1y': 11880,
}

/** @deprecated Use PLAN_TOTAL_CENTS_BRL — kept for Stripe webhook compatibility */
export const PLAN_AMOUNT_CENTS: Record<BillingPlan, number> = PLAN_TOTAL_CENTS_BRL

export const PLAN_LABEL_PT: Record<BillingPlan, string> = {
  '1m': 'Acesso por 1 mês',
  '3m': 'Acesso por 3 meses',
  '6m': 'Acesso por 6 meses',
  '1y': 'Acesso por 12 meses',
}

export const PLAN_LABEL: Record<BillingPlan, string> = PLAN_LABEL_PT

export function formatBrl(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function monthlyInstallmentCents(plan: BillingPlan): number {
  const total = PLAN_TOTAL_CENTS_BRL[plan]
  const months = PLAN_MONTHS[plan]
  return Math.round(total / months)
}

export function isBillingPlan(v: string): v is BillingPlan {
  return (BILLING_PLANS as readonly string[]).includes(v)
}

export function addMonths(d: Date, months: number) {
  const out = new Date(d)
  out.setMonth(out.getMonth() + months)
  return out
}
