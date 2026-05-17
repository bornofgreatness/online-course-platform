'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import { useI18n } from '../../components/LanguageProvider'
import { formatMoney } from '../../lib/i18n/format'

export default function AffiliatePage() {
  const { t, language } = useI18n()
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
      if (!res.ok) throw new Error(json?.error || t('affiliate.loadFailed'))
      setAffiliate(json.affiliate)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('affiliate.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const register = async () => {
    setRegistering(true)
    setError(null)
    try {
      const res = await fetch('/api/affiliate/register', { method: 'POST' })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || t('affiliate.registerFailed'))
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('affiliate.registerFailed'))
    } finally {
      setRegistering(false)
    }
  }

  return (
    <>
      <Header />
      <PageShell>
        <h1 className={siteTitleClass}>{t('common.affiliate')}</h1>
        <p className={`${siteMutedClass} mt-2 max-w-2xl`}>{t('affiliate.intro')}</p>

        {loading ? (
          <p className="mt-6 text-slate-600">{t('common.loading')}</p>
        ) : !affiliate ? (
          <div className={`${siteCardClass} mt-8 max-w-lg p-6`}>
            <p className="text-slate-700">{t('affiliate.notRegistered')}</p>
            <button
              type="button"
              disabled={registering}
              onClick={register}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {registering ? t('common.working') : t('affiliate.become')}
            </button>
            <p className={`${siteMutedClass} mt-3 text-xs`}>{t('affiliate.roleNote')}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className={`${siteCardClass} p-6`}>
              <h2 className="text-lg font-bold text-blue-950">{t('affiliate.referralLink')}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {t('affiliate.code')} {affiliate.referralCode}
              </p>
              {affiliate.referralLink ? (
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800">
                  {affiliate.referralLink}
                </p>
              ) : (
                <p className={`${siteMutedClass} mt-2 text-sm`}>{t('affiliate.setAppUrl')}</p>
              )}
            </div>
            <div className={`${siteCardClass} p-6`}>
              <h2 className="text-lg font-bold text-blue-950">{t('affiliate.performance')}</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t('affiliate.referrals')}</dt>
                  <dd className="font-semibold tabular-nums">{affiliate.referralCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t('affiliate.paidCommissions')}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatMoney(Math.round(affiliate.commissionsPaid * 100), language)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">{t('affiliate.pendingCommissions')}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatMoney(Math.round(affiliate.commissionsPending * 100), language)}
                  </dd>
                </div>
              </dl>
            </div>
            {affiliate.recentCommissions.length > 0 ? (
              <div className={`${siteCardClass} p-6 lg:col-span-2`}>
                <h2 className="text-lg font-bold text-blue-950">{t('affiliate.recentCommissions')}</h2>
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {affiliate.recentCommissions.map((c) => (
                    <li key={c.id} className="flex justify-between py-2">
                      <span className="text-slate-600">{new Date(c.createdAt).toLocaleString()}</span>
                      <span className="font-medium tabular-nums">
                        {formatMoney(Math.round(c.amount * 100), language)}
                      </span>
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
            ← {t('common.dashboard')}
          </Link>
        </p>
      </PageShell>
    </>
  )
}
