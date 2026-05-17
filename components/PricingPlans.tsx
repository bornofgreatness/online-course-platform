'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { BillingPlan } from '../lib/billingPlans'
import { PLAN_MONTHS, PLAN_TOTAL_CENTS_BRL } from '../lib/billingPlans'
import { formatMoney } from '../lib/i18n/format'
import { useI18n } from './LanguageProvider'
import type { TranslationKey } from '../lib/i18n/translations'

const plans: BillingPlan[] = ['1m', '3m', '6m', '1y']
const planKeys: Record<BillingPlan, TranslationKey> = {
  '1m': 'pricing.plan.1m',
  '3m': 'pricing.plan.3m',
  '6m': 'pricing.plan.6m',
  '1y': 'pricing.plan.1y',
}

type PaymentProvider = 'stripe' | 'mercadopago'
const mpEnabled = process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED === 'true'

export default function PricingPlans() {
  const { t, language } = useI18n()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [busy, setBusy] = useState<BillingPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponPreview, setCouponPreview] = useState<{
    valid: boolean
    finalCents?: number
    discountCents?: number
    error?: string
  } | null>(null)
  const [provider, setProvider] = useState<PaymentProvider>(mpEnabled ? 'mercadopago' : 'stripe')

  async function validateCoupon(plan: BillingPlan) {
    if (!couponCode.trim()) {
      setCouponPreview(null)
      return
    }
    const res = await fetch(
      `/api/coupons/validate?code=${encodeURIComponent(couponCode)}&plan=${plan}`
    )
    const data = await res.json()
    setCouponPreview(data)
  }

  async function checkout(plan: BillingPlan) {
    setError(null)
    if (status !== 'authenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=/pricing`)
      return
    }

    setBusy(plan)
    try {
      const endpoint =
        provider === 'mercadopago' ? '/api/billing/mercadopago/checkout' : '/api/billing/checkout'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, couponCode: couponCode.trim() || undefined }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || t('pricing.checkoutFailed'))
      }

      if (data?.url) {
        window.location.href = data.url as string
        return
      }

      throw new Error(t('pricing.noCheckoutUrl'))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('pricing.checkoutFailed'))
    } finally {
      setBusy(null)
    }
  }

  function displayTotal(plan: BillingPlan) {
    if (couponPreview?.valid && couponPreview.finalCents != null) {
      return couponPreview.finalCents
    }
    return PLAN_TOTAL_CENTS_BRL[plan]
  }

  function displayMonthly(plan: BillingPlan) {
    return Math.round(displayTotal(plan) / PLAN_MONTHS[plan])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">{t('pricing.couponLabel')}</label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t('pricing.couponPlaceholder')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
          />
        </div>
        <button
          type="button"
          onClick={() => validateCoupon('3m')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          {t('pricing.validateCoupon')}
        </button>
      </div>

      {couponPreview && (
        <p className={`text-sm ${couponPreview.valid ? 'text-green-700' : 'text-red-600'}`}>
          {couponPreview.valid
            ? t('pricing.couponApplied', {
                amount: formatMoney(couponPreview.discountCents || 0, language),
              })
            : couponPreview.error || t('pricing.couponInvalid')}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-600">{t('pricing.paymentMethod')}</span>
        {mpEnabled && (
          <button
            type="button"
            onClick={() => setProvider('mercadopago')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${
              provider === 'mercadopago' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {t('pricing.mercadoPago')}
          </button>
        )}
        <button
          type="button"
          onClick={() => setProvider('stripe')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            provider === 'stripe' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {t('pricing.stripe')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const months = PLAN_MONTHS[plan]
          const monthly = displayMonthly(plan)
          const total = displayTotal(plan)
          const highlight = plan === '3m'

          return (
            <div
              key={plan}
              className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-black/5 ${
                highlight ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              {highlight ? (
                <span className="mb-2 w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  {t('pricing.mostPopular')}
                </span>
              ) : null}
              <h2 className="text-lg font-bold text-blue-950">{t(planKeys[plan])}</h2>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                {formatMoney(monthly, language)}
                <span className="text-base font-semibold text-slate-600">{t('pricing.perMonth')}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t('pricing.total')} {formatMoney(total, language)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {months} {months === 1 ? t('common.month') : t('common.months')} {t('pricing.fullAccess')}
              </p>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => checkout(plan)}
                className="mt-auto w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {busy === plan ? t('pricing.wait') : t('pricing.subscribeNow')}
              </button>
            </div>
          )
        })}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}
    </div>
  )
}
