import { getPrisma } from './prisma'
import { isBillingPlan, PLAN_TOTAL_CENTS_BRL, PLAN_LABEL_PT, type BillingPlan } from './billingPlans'
import { computeDiscountedCents, validateCouponRecord } from './coupons'

export async function resolveCheckoutPricing(plan: string, couponCode?: string) {
  if (!isBillingPlan(plan)) {
    throw new Error('Plano inválido')
  }

  const billingPlan = plan as BillingPlan
  let finalCents = PLAN_TOTAL_CENTS_BRL[billingPlan]
  let couponId: string | undefined
  let discountCents = 0

  if (couponCode?.trim()) {
    const prisma = getPrisma()
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    })
    const err = validateCouponRecord(coupon)
    if (err) throw new Error(err)
    const computed = computeDiscountedCents(coupon!, billingPlan)
    finalCents = computed.finalCents
    discountCents = computed.discountCents
    couponId = coupon!.id
  }

  return {
    plan: billingPlan,
    title: PLAN_LABEL_PT[billingPlan],
    finalCents,
    finalBrl: finalCents / 100,
    couponId,
    discountCents,
  }
}
