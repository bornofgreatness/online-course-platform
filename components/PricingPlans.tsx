'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { BillingPlan } from '../lib/billingPlans'
import { PLAN_AMOUNT_CENTS, PLAN_LABEL, PLAN_MONTHS } from '../lib/billingPlans'

const plans: BillingPlan[] = ['1m', '3m', '6m', '1y']

export default function PricingPlans() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [busy, setBusy] = useState<BillingPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkout(plan: BillingPlan) {
    setError(null)
    if (status !== 'authenticated' || !session) {
      router.push(`/auth/signin?callbackUrl=/pricing`)
      return
    }
    setBusy(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || 'Checkout failed')
      }
      if (data?.url) {
        window.location.href = data.url as string
        return
      }
      throw new Error('No checkout URL returned')
    } catch (e: any) {
      setError(e?.message || 'Checkout failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const usd = (PLAN_AMOUNT_CENTS[plan] / 100).toFixed(2)
        const months = PLAN_MONTHS[plan]
        return (
          <div
            key={plan}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            <h2 className="text-lg font-bold text-blue-950">{PLAN_LABEL[plan]}</h2>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">${usd}</p>
            <p className="mt-1 text-xs text-slate-500">{months} month(s) full catalog access</p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => checkout(plan)}
              className="mt-auto w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {busy === plan ? 'Redirecting…' : 'Subscribe'}
            </button>
          </div>
        )
      })}
      {error ? (
        <p className="sm:col-span-2 lg:col-span-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}
    </div>
  )
}
