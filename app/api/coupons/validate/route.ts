import { NextResponse } from 'next/server'
import { getPrisma } from '../../../../lib/prisma'
import { isBillingPlan } from '../../../../lib/billingPlans'
import { computeDiscountedCents, validateCouponRecord } from '../../../../lib/coupons'
import type { BillingPlan } from '../../../../lib/billingPlans'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim()
  const plan = searchParams.get('plan')?.trim() || ''

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Informe o cupom' }, { status: 400 })
  }
  if (!isBillingPlan(plan)) {
    return NextResponse.json({ valid: false, error: 'Plano inválido' }, { status: 400 })
  }

  const prisma = getPrisma()
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  const err = validateCouponRecord(coupon)
  if (err) {
    return NextResponse.json({ valid: false, error: err })
  }

  const pricing = computeDiscountedCents(coupon!, plan as BillingPlan)
  return NextResponse.json({
    valid: true,
    code: coupon!.code,
    discountCents: pricing.discountCents,
    finalCents: pricing.finalCents,
    originalCents: pricing.originalCents,
  })
}
