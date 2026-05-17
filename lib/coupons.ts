import type { Coupon } from './generated/prisma'
import type { BillingPlan } from './billingPlans'
import { PLAN_TOTAL_CENTS_BRL } from './billingPlans'

export type CouponValidation = {
  valid: boolean
  error?: string
  coupon?: Coupon
  originalCents: number
  finalCents: number
  discountCents: number
}

export function computeDiscountedCents(coupon: Coupon, plan: BillingPlan): CouponValidation {
  const originalCents = PLAN_TOTAL_CENTS_BRL[plan]
  let discountCents = 0

  if (coupon.discountPercent != null && coupon.discountPercent > 0) {
    discountCents = Math.round((originalCents * coupon.discountPercent) / 100)
  } else if (coupon.discountCents != null && coupon.discountCents > 0) {
    discountCents = coupon.discountCents
  }

  discountCents = Math.min(discountCents, originalCents - 100)
  const finalCents = Math.max(100, originalCents - discountCents)

  return {
    valid: true,
    coupon,
    originalCents,
    finalCents,
    discountCents,
  }
}

export function validateCouponRecord(coupon: Coupon | null, now = new Date()): string | null {
  if (!coupon) return 'Cupom não encontrado'
  if (!coupon.active) return 'Cupom inativo'
  if (coupon.validFrom && coupon.validFrom > now) return 'Cupom ainda não válido'
  if (coupon.validUntil && coupon.validUntil < now) return 'Cupom expirado'
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return 'Cupom esgotado'
  if (coupon.discountPercent == null && coupon.discountCents == null) return 'Cupom mal configurado'
  return null
}
