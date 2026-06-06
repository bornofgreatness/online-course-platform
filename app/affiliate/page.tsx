'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell, {
  siteAlertErrorClass,
  siteCardClass,
  siteEyebrowClass,
  siteInsetPanelClass,
  siteLinkClass,
  siteMutedClass,
  sitePageHeroClass,
  sitePrimaryBtnClass,
  siteSecondaryBtnClass,
  siteSectionTitleClass,
  siteStatCardClass,
  siteStatusBadgeClass,
} from '../../components/PageShell'
import LoadingImage from '../../components/LoadingImage'
import LoadingButtonLabel from '../../components/LoadingButtonLabel'
import { useI18n } from '../../components/LanguageProvider'
import { formatMoney } from '../../lib/i18n/format'

export default function AffiliatePage() {
  const { t, language } = useI18n()
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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

  const copyLink = async () => {
    if (!affiliate?.referralLink) return
    try {
      await navigator.clipboard.writeText(affiliate.referralLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <Header />
      <PageShell>
        <header className={sitePageHeroClass}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_50%)]" />
          <div className="relative">
            <p className={`${siteEyebrowClass} text-teal-300/90`}>{t('common.affiliate')}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {t('common.affiliate')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
              {t('affiliate.intro')}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              ← {t('common.dashboard')}
            </Link>
          </div>
        </header>

        {error ? <div className={`${siteAlertErrorClass} mt-6`}>{error}</div> : null}

        {loading ? (
          <LoadingImage size="lg" label={t('common.loading')} className="mt-12 py-12" />
        ) : !affiliate ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className={`${siteCardClass} p-6 sm:p-8 lg:col-span-3`}>
              <h2 className="text-xl font-bold text-blue-950 sm:text-2xl">{t('affiliate.become')}</h2>
              <p className={`${siteMutedClass} mt-3`}>{t('affiliate.notRegistered')}</p>
              <button
                type="button"
                disabled={registering}
                aria-busy={registering}
                onClick={register}
                className={`${sitePrimaryBtnClass} mt-6 min-w-[10rem]`}
              >
                <LoadingButtonLabel loading={registering} label={t('common.loading')}>
                  {t('affiliate.become')}
                </LoadingButtonLabel>
              </button>
              <p className={`${siteMutedClass} mt-4 text-xs`}>{t('affiliate.roleNote')}</p>
            </div>
            <div className={`${siteInsetPanelClass} flex flex-col justify-center lg:col-span-2`}>
              <p className={siteSectionTitleClass}>{t('affiliate.performance')}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                    1
                  </span>
                  {t('affiliate.referralLink')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                    2
                  </span>
                  {t('affiliate.referrals')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                    3
                  </span>
                  {t('affiliate.paidCommissions')}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="-mt-4 mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className={`${siteStatCardClass} border-t-4 border-t-blue-600`}>
                <p className={siteSectionTitleClass}>{t('affiliate.referrals')}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                  {affiliate.referralCount}
                </p>
              </div>
              <div className={`${siteStatCardClass} border-t-4 border-t-emerald-600`}>
                <p className={siteSectionTitleClass}>{t('affiliate.paidCommissions')}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                  {formatMoney(Math.round(affiliate.commissionsPaid * 100), language)}
                </p>
              </div>
              <div className={`${siteStatCardClass} border-t-4 border-t-amber-500`}>
                <p className={siteSectionTitleClass}>{t('affiliate.pendingCommissions')}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                  {formatMoney(Math.round(affiliate.commissionsPending * 100), language)}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className={`${siteCardClass} p-6 sm:p-7`}>
                <h2 className="text-lg font-bold text-blue-950">{t('affiliate.referralLink')}</h2>
                <div className={`${siteInsetPanelClass} mt-4`}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('affiliate.code')}</p>
                  <p className="mt-1 font-mono text-lg font-bold text-blue-950">{affiliate.referralCode}</p>
                </div>
                {affiliate.referralLink ? (
                  <>
                    <p className="mt-4 break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-800">
                      {affiliate.referralLink}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={copyLink}
                        className={sitePrimaryBtnClass}
                      >
                        {copied ? t('affiliate.copied') : t('affiliate.copyLink')}
                      </button>
                      <a
                        href={affiliate.referralLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={siteSecondaryBtnClass}
                      >
                        {t('affiliate.openLink')}
                      </a>
                    </div>
                  </>
                ) : (
                  <p className={`${siteMutedClass} mt-4 text-sm`}>{t('affiliate.setAppUrl')}</p>
                )}
              </div>

              <div className={`${siteCardClass} p-6 sm:p-7`}>
                <h2 className="text-lg font-bold text-blue-950">{t('affiliate.performance')}</h2>
                <dl className="mt-5 space-y-3">
                  {[
                    { label: t('affiliate.referrals'), value: String(affiliate.referralCount) },
                    {
                      label: t('affiliate.paidCommissions'),
                      value: formatMoney(Math.round(affiliate.commissionsPaid * 100), language),
                    },
                    {
                      label: t('affiliate.pendingCommissions'),
                      value: formatMoney(Math.round(affiliate.commissionsPending * 100), language),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <dt className="text-sm text-slate-600">{row.label}</dt>
                      <dd className="text-sm font-bold tabular-nums text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {affiliate.recentCommissions.length > 0 ? (
                <div className={`${siteCardClass} p-6 sm:p-7 lg:col-span-2`}>
                  <h2 className={`${siteSectionTitleClass} mb-4`}>{t('affiliate.recentCommissions')}</h2>
                  <ul className="space-y-2">
                    {affiliate.recentCommissions.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          {formatMoney(Math.round(c.amount * 100), language)}
                        </span>
                        <span className={siteStatusBadgeClass(c.status)}>{c.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        )}

        {!loading && affiliate ? (
          <p className="mt-10">
            <Link href="/dashboard" className={siteLinkClass}>
              ← {t('common.dashboard')}
            </Link>
          </p>
        ) : null}
      </PageShell>
    </>
  )
}
