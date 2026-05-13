/** Plan keys sent from pricing UI and Stripe Checkout metadata. */
export const BILLING_PLANS = ['1m', '3m', '6m', '1y'] as const
export type BillingPlan = (typeof BILLING_PLANS)[number]

export const PLAN_MONTHS: Record<BillingPlan, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '1y': 12,
}

/** One-time checkout amounts in USD cents (configure Stripe Prices later if preferred). */
export const PLAN_AMOUNT_CENTS: Record<BillingPlan, number> = {
  '1m': 1900,
  '3m': 4900,
  '6m': 8900,
  '1y': 14900,
}

export const PLAN_LABEL: Record<BillingPlan, string> = {
  '1m': '1 month access',
  '3m': '3 months access',
  '6m': '6 months access',
  '1y': '1 year access',
}

export function isBillingPlan(v: string): v is BillingPlan {
  return (BILLING_PLANS as readonly string[]).includes(v)
}

export function addMonths(d: Date, months: number) {
  const out = new Date(d)
  out.setMonth(out.getMonth() + months)
  return out
}
