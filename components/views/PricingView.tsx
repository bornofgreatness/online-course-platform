'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PricingPlans from '../PricingPlans'
import { useI18n } from '../LanguageProvider'
import type { TranslationKey } from '../../lib/i18n/translations'

const FEATURE_KEYS: TranslationKey[] = [
  'pricing.featureCatalog',
  'pricing.featureQuizzes',
  'pricing.featureCertificates',
  'pricing.featureFlexible',
]

export default function PricingView() {
  const { t } = useI18n()
  const { status } = useSession()
  const needsSignIn = status === 'unauthenticated'

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 sm:py-16 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200 sm:text-sm">
            {t('pricing.heroBadge')}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {t('common.prices')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/95 sm:text-lg">
            {t('pricing.intro')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-full border-2 border-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              {t('common.browseCourses')}
            </Link>
            {needsSignIn && (
              <Link
                href="/auth/signup"
                className="rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg transition hover:bg-teal-50"
              >
                {t('common.signupFreeCta')}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('pricing.featuresTitle')}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key) => (
            <li
              key={key}
              className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/5"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white"
                aria-hidden
              >
                ✓
              </span>
              <span className="text-sm font-medium text-slate-700">{t(key)}</span>
            </li>
          ))}
        </ul>

        {needsSignIn && (
          <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
            {t('pricing.signInHint')}{' '}
            <Link href="/auth/signin?callbackUrl=/pricing" className="font-bold text-amber-950 underline">
              {t('common.login')}
            </Link>
          </p>
        )}

        <div className="mt-10">
          <PricingPlans showFeatures={false} />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">{t('pricing.stripeNote')}</p>
      </section>
    </div>
  )
}
