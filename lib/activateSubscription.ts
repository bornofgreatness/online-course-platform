import type { PrismaClient } from './generated/prisma'
import { addMonths, isBillingPlan, PLAN_MONTHS, type BillingPlan } from './billingPlans'

export type ActivateSubscriptionInput = {
  userId: string
  plan: string
  amountBrl: number
  currency?: string
  provider: 'stripe' | 'mercadopago'
  externalId: string
  couponId?: string | null
}

export async function activateSubscription(prisma: PrismaClient, input: ActivateSubscriptionInput) {
  if (!isBillingPlan(input.plan)) {
    throw new Error(`Invalid plan: ${input.plan}`)
  }

  const plan = input.plan as BillingPlan
  const months = PLAN_MONTHS[plan]

  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findFirst({
      where: { provider: input.provider, externalId: input.externalId, status: 'succeeded' },
    })
    if (existing) return

    await tx.subscription.updateMany({
      where: { userId: input.userId, active: true },
      data: { active: false },
    })

    const start = new Date()
    const end = addMonths(start, months)
    await tx.subscription.create({
      data: {
        userId: input.userId,
        plan,
        startDate: start,
        endDate: end,
        active: true,
      },
    })

    await tx.payment.create({
      data: {
        userId: input.userId,
        amount: input.amountBrl,
        currency: (input.currency || 'brl').toLowerCase(),
        status: 'succeeded',
        provider: input.provider,
        externalId: input.externalId,
        stripeId: input.provider === 'stripe' ? input.externalId : null,
        couponId: input.couponId || null,
      },
    })

    if (input.couponId) {
      await tx.coupon.update({
        where: { id: input.couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    const referral = await tx.referral.findFirst({
      where: { referredUserId: input.userId },
      orderBy: { createdAt: 'desc' },
    })
    if (referral && input.amountBrl > 0) {
      const commission = Math.round(input.amountBrl * 10) / 100
      if (commission > 0) {
        await tx.affiliateCommission.create({
          data: {
            affiliateId: referral.affiliateId,
            referredUserId: input.userId,
            amount: commission,
            status: 'PENDING',
          },
        })
      }
    }
  })
}
