'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import { useI18n } from '../../components/LanguageProvider'

export default function AffiliatePage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [affiliate, setAffiliate] = useState<{
    referralCode: string
    referralLink: string | null
    referralCount: number
    commissionsPaid: number
    commissionsPending: number
    recentCommissions: Array<{ id: string; amount: number; status: string; createdAt: string }>
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/affiliate/me')
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || 'Failed to load')
      setAffiliate(json.affiliate)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const register = async () => {
    setRegistering(true)
    setError(null)
    try {
      const res = await fetch('/api/affiliate/register', { method: 'POST' })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || 'Registration failed')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <>
      <Header />
      <PageShell>
<h1 className={siteTitleClass}>{t('common.affiliate')}</h1>
        <p className={`${siteMutedClass} mt-2 max-w-2xl`}>
          Share your referral link. When referred learners subscribe, you earn a commission (pending admin payout in this
          MVP).
        </p>

        {loading ? (
          <p className="mt-6 text-slate-600">Loading…</p>
        ) : !affiliate ? (
          <div className={`${siteCardClass} mt-8 max-w-lg p-6`}>
            <p className="text-slate-700">You are not registered as an affiliate yet.</p>
            <button
              type="button"
              disabled={registering}
              onClick={register}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {registering ? 'Working…' : 'Become an affiliate'}
            </button>
            <p className={`${siteMutedClass} mt-3 text-xs`}>Your account role will switch to AFFILIATE.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className={`${siteCardClass} p-6`}>
              <h2 className="text-lg font-bold text-blue-950">Your referral link</h2>
              <p className="mt-2 text-sm text-slate-600">Code: {affiliate.referralCode}</p>
              {affiliate.referralLink ? (
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800">
                  {affiliate.referralLink}
                </p>
              ) : (
                <p className={`${siteMutedClass} mt-2 text-sm`}>Set NEXT_PUBLIC_APP_URL for a full shareable URL.</p>
              )}
            </div>
            <div className={`${siteCardClass} p-6`}>
              <h2 className="text-lg font-bold text-blue-950">Performance</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Referrals</dt>
                  <dd className="font-semibold tabular-nums">{affiliate.referralCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Paid commissions (USD)</dt>
                  <dd className="font-semibold tabular-nums">${affiliate.commissionsPaid.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Pending (USD)</dt>
                  <dd className="font-semibold tabular-nums">${affiliate.commissionsPending.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
            {affiliate.recentCommissions.length > 0 ? (
              <div className={`${siteCardClass} p-6 lg:col-span-2`}>
                <h2 className="text-lg font-bold text-blue-950">Recent commissions</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {affiliate.recentCommissions.map((c) => (
                    <li key={c.id} className="flex justify-between py-2">
                      <span className="text-slate-600">{new Date(c.createdAt).toLocaleString()}</span>
                      <span className="font-medium tabular-nums">${c.amount.toFixed(2)}</span>
                      <span className="text-xs uppercase text-slate-500">{c.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-10">
          <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Dashboard
          </Link>
        </p>
      </PageShell>
    </>
  )
}
