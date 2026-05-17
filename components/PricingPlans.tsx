'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { BillingPlan } from '../lib/billingPlans'
import {
  PLAN_LABEL_PT,
  PLAN_MONTHS,
  PLAN_TOTAL_CENTS_BRL,
  formatBrl,
  monthlyInstallmentCents,
} from '../lib/billingPlans'

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
        throw new Error(data?.error || 'Falha no checkout')
      }

      if (data?.url) {
        window.location.href = data.url as string
        return
      }

      throw new Error('URL de checkout não retornada')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Falha no checkout')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const months = PLAN_MONTHS[plan]
        const monthly = monthlyInstallmentCents(plan)
        const total = PLAN_TOTAL_CENTS_BRL[plan]
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
                Mais popular
              </span>
            ) : null}
            <h2 className="text-lg font-bold text-blue-950">{PLAN_LABEL_PT[plan]}</h2>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {formatBrl(monthly)}
              <span className="text-base font-semibold text-slate-600"> / mês</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Total: {formatBrl(total)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {months} {months === 1 ? 'mês' : 'meses'} · Acesso a todos os cursos
            </p>

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => checkout(plan)}
              className="mt-auto w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {busy === plan ? 'Aguarde...' : 'Assinar agora'}
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
