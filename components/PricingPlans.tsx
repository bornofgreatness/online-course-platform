'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { BillingPlan } from '../lib/billingPlans'
import { PLAN_MONTHS, PLAN_TOTAL_CENTS_BRL } from '../lib/billingPlans'
import { formatMoney } from '../lib/i18n/format'
import { useI18n } from './LanguageProvider'
import LoadingButtonLabel from './LoadingButtonLabel'
import LoadingImage from './LoadingImage'
import type { TranslationKey } from '../lib/i18n/translations'

const plans: BillingPlan[] = ['1m', '3m', '6m', '1y']
const planKeys: Record<BillingPlan, TranslationKey> = {
  '1m': 'pricing.plan.1m',
  '3m': 'pricing.plan.3m',
  '6m': 'pricing.plan.6m',
  '1y': 'pricing.plan.1y',
}

const PLAN_ACCENT: Record<
  BillingPlan,
  { gradient: string; badge: string; button: string; ring: string; price: string }
> = {
  '1m': {
    gradient: 'from-slate-50 via-white to-slate-50',
    badge: 'bg-slate-600',
    button: 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20',
    ring: 'border-slate-200',
    price: 'text-slate-900',
  },
  '3m': {
    gradient: 'from-blue-50 via-white to-teal-50/50',
    badge: 'bg-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
    ring: 'border-blue-400',
    price: 'text-blue-950',
  },
  '6m': {
    gradient: 'from-teal-50 via-white to-emerald-50/40',
    badge: 'bg-teal-600',
    button: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/25',
    ring: 'border-teal-300',
    price: 'text-teal-950',
  },
  '1y': {
    gradient: 'from-violet-50 via-white to-indigo-50/40',
    badge: 'bg-violet-600',
    button: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25',
    ring: 'border-violet-300',
    price: 'text-violet-950',
  },
}

type PricingPlansProps = {
  /** When true, shows the feature checklist above plans (e.g. landing embed). */
  showFeatures?: boolean
}

export default function PricingPlans({ showFeatures = false }: PricingPlansProps) {
  const { t, language } = useI18n()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [busy, setBusy] = useState<BillingPlan | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponPreview, setCouponPreview] = useState<{
    valid: boolean
    finalCents?: number
    discountCents?: number
    error?: string
  } | null>(null)

  async function validateCoupon(plan: BillingPlan) {
    if (!couponCode.trim()) {
      setCouponPreview(null)
      return
    }
    setValidatingCoupon(true)
    try {
      const res = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(couponCode)}&plan=${plan}`
      )
      const data = await res.json()
      setCouponPreview(data)
    } finally {
      setValidatingCoupon(false)
    }
  }

  async function checkout(plan: BillingPlan) {
    setError(null)
    if (status !== 'authenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=/pricing`)
      return
    }

    setBusy(plan)
    try {
      const res = await fetch('/api/billing/mercadopago/checkout', {
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
    <div className="space-y-8">
      {/* Coupon */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('pricing.couponLabel')}
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={t('pricing.couponPlaceholder')}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="button"
            disabled={validatingCoupon}
            aria-busy={validatingCoupon}
            onClick={() => validateCoupon('3m')}
            className="inline-flex min-w-[8rem] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <LoadingButtonLabel loading={validatingCoupon} color="default" label={t('common.loading')}>
              {t('pricing.validateCoupon')}
            </LoadingButtonLabel>
          </button>
        </div>
        {couponPreview && (
          <p
            className={`mt-3 text-sm font-medium ${couponPreview.valid ? 'text-emerald-700' : 'text-red-600'}`}
          >
            {couponPreview.valid
              ? t('pricing.couponApplied', {
                  amount: formatMoney(couponPreview.discountCents || 0, language),
                })
              : couponPreview.error || t('pricing.couponInvalid')}
          </p>
        )}
      </div>

      <p className="text-center text-xs font-medium text-slate-500">
        {t('pricing.paymentMethod')}: {t('pricing.mercadoPago')}
      </p>

      {/* Plans */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch lg:gap-4 xl:gap-5">
        {plans.map((plan) => {
          const months = PLAN_MONTHS[plan]
          const monthly = displayMonthly(plan)
          const total = displayTotal(plan)
          const highlight = plan === '3m'
          const accent = PLAN_ACCENT[plan]

          return (
            <div
              key={plan}
              className={[
                'relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-lg',
                accent.gradient,
                accent.ring,
                highlight ? 'z-10 lg:-mt-2 lg:mb-2 lg:scale-[1.03] lg:shadow-xl lg:ring-2 lg:ring-blue-500/30' : '',
              ].join(' ')}
            >
              {highlight && (
                <span
                  className={`absolute right-4 top-4 rounded-full ${accent.badge} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm`}
                >
                  {t('pricing.mostPopular')}
                </span>
              )}

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-lg font-bold text-slate-400 shadow-sm ring-1 ring-black/5">
                {months}
              </div>

              <h2 className="pr-16 text-lg font-bold text-slate-900">{t(planKeys[plan])}</h2>

              <div className="mt-4">
                <p className={`text-3xl font-bold tabular-nums tracking-tight ${accent.price}`}>
                  {formatMoney(monthly, language)}
                </p>
                <p className="text-sm font-semibold text-slate-500">{t('pricing.perMonth')}</p>
              </div>

              <p className="mt-3 text-xs font-medium text-slate-500">
                {t('pricing.total')} {formatMoney(total, language)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {months} {months === 1 ? t('common.month') : t('common.months')} {t('pricing.fullAccess')}
              </p>

              {showFeatures && (
                <ul className="mt-4 space-y-1.5 border-t border-slate-200/60 pt-4 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-teal-600" aria-hidden>
                      ✓
                    </span>
                    {t('pricing.featureCatalog')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-teal-600" aria-hidden>
                      ✓
                    </span>
                    {t('pricing.featureQuizzes')}
                  </li>
                </ul>
              )}

              <button
                type="button"
                disabled={busy !== null}
                aria-busy={busy === plan}
                onClick={() => checkout(plan)}
                className={[
                  'mt-6 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50',
                  accent.button,
                ].join(' ')}
              >
                <LoadingButtonLabel loading={busy === plan} label={t('common.loading')}>
                  {t('pricing.subscribeNow')}
                </LoadingButtonLabel>
              </button>
            </div>
          )
        })}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  )
}
