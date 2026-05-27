'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import Header from '../Header'
import WhatsAppFloat from '../WhatsAppButton'
import { useI18n } from '../LanguageProvider'
import type { Language, TranslationKey } from '../../lib/i18n/translations'
import { getSeoKeywords } from '../../lib/seo/keywords'
import { SEO_LANDING_PATH_EN, SEO_LANDING_PATH_PT } from '../../lib/seo/paths'

const BENEFIT_KEYS: TranslationKey[] = [
  'seo.benefit1',
  'seo.benefit2',
  'seo.benefit3',
  'seo.benefit4',
  'seo.benefit5',
  'seo.benefit6',
]

const AREA_KEYS = [
  { title: 'seo.area1Title', text: 'seo.area1Text', kw: 'seo.area1Kw' },
  { title: 'seo.area2Title', text: 'seo.area2Text', kw: 'seo.area2Kw' },
  { title: 'seo.area3Title', text: 'seo.area3Text', kw: 'seo.area3Kw' },
  { title: 'seo.area4Title', text: 'seo.area4Text', kw: 'seo.area4Kw' },
  { title: 'seo.area5Title', text: 'seo.area5Text', kw: 'seo.area5Kw' },
  { title: 'seo.area6Title', text: 'seo.area6Text', kw: 'seo.area6Kw' },
] as const

const TAG_KEYS: TranslationKey[] = [
  'seo.tag100',
  'seo.tag80',
  'seo.tag50',
  'seo.tag20',
  'seo.tagPdf',
  'seo.tagVerify',
]

const FAQ_KEYS = [
  { q: 'seo.faq1q', a: 'seo.faq1a' },
  { q: 'seo.faq2q', a: 'seo.faq2a' },
  { q: 'seo.faq3q', a: 'seo.faq3a' },
  { q: 'seo.faq4q', a: 'seo.faq4a' },
  { q: 'seo.faq5q', a: 'seo.faq5a' },
] as const

type Props = {
  pageLocale: Language
}

export default function SeoCursosOnlineView({ pageLocale }: Props) {
  const { t, language, setLanguage } = useI18n()

  useEffect(() => {
    if (language !== pageLocale) setLanguage(pageLocale)
  }, [pageLocale, language, setLanguage])

  const keywords = getSeoKeywords(pageLocale)
  const altPath = pageLocale === 'pt' ? SEO_LANDING_PATH_EN : SEO_LANDING_PATH_PT
  const altLabel = pageLocale === 'pt' ? t('seo.switchToEn') : t('seo.switchToPt')

  return (
    <>
      <Header />
      <WhatsAppFloat />

      <article className="min-h-screen bg-slate-50">
        <header className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200 sm:text-sm">
                {t('seo.heroBadge')}
              </p>
              <Link
                href={altPath}
                className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
                hrefLang={pageLocale === 'pt' ? 'en' : 'pt-BR'}
              >
                {altLabel}
              </Link>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t('seo.heroTitle')}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-blue-100/95 sm:text-lg">
              <strong className="font-semibold text-white">{t('certificate.brandName')}</strong>{' '}
              {t('seo.heroLead')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg hover:bg-teal-50"
              >
                {t('seo.ctaStart')}
              </Link>
              <Link
                href="/courses"
                className="rounded-full border-2 border-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10"
              >
                {t('seo.ctaCourses')}
              </Link>
              <Link
                href="/certificates"
                className="rounded-full border-2 border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t('seo.ctaCertificate')}
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16" aria-labelledby="beneficios">
          <h2 id="beneficios" className="text-2xl font-bold text-blue-950 sm:text-3xl">
            {t('seo.benefitsTitle')}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFIT_KEYS.map((key) => (
              <li
                key={key}
                className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  ✓
                </span>
                <span className="text-sm font-medium leading-relaxed text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-slate-200 bg-white py-12 md:py-16" aria-labelledby="areas">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 id="areas" className="text-2xl font-bold text-blue-950 sm:text-3xl">
              {t('seo.areasTitle')}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">{t('seo.areasIntro')}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {AREA_KEYS.map((area) => (
                <div
                  key={area.title}
                  className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-900">{t(area.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(area.text)}</p>
                  <p className="mt-3 text-xs text-slate-400">{t(area.kw)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16" aria-labelledby="certificado">
          <div className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50 p-8 ring-1 ring-teal-200/60 sm:p-10">
            <h2 id="certificado" className="text-2xl font-bold text-blue-950 sm:text-3xl">
              {t('seo.certTitle')}
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-700">{t('seo.certBody')}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TAG_KEYS.map((tagKey) => (
                <li
                  key={tagKey}
                  className="rounded-full bg-blue-950/5 px-3.5 py-1.5 text-xs font-semibold text-blue-900 ring-1 ring-blue-950/10"
                >
                  {t(tagKey)}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-8 inline-flex rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700"
            >
              {t('seo.pricingCta')}
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-100/80 py-12 md:py-16" aria-labelledby="faq">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 id="faq" className="text-center text-2xl font-bold text-blue-950 sm:text-3xl">
              {t('seo.faqTitle')}
            </h2>
            <dl className="mt-8 space-y-6">
              {FAQ_KEYS.map((item) => (
                <div key={item.q} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <dt className="font-bold text-slate-900">{t(item.q)}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-600">{t(item.a)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white py-10" aria-label={t('seo.topicsTitle')}>
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{t('seo.topicsTitle')}</h2>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              {keywords.slice(0, 40).join(' · ')}
            </p>
          </div>
        </section>

        <footer className="bg-blue-950 py-10 text-center text-white">
          <p className="text-lg font-bold">{t('seo.footerTitle')}</p>
          <p className="mt-2 text-sm text-blue-100/80">{t('seo.footerSub')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth/signup" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-blue-950">
              {t('seo.footerSignup')}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/50 px-8 py-3 text-sm font-semibold hover:bg-white/10"
            >
              {t('seo.footerHome')}
            </Link>
          </div>
        </footer>
      </article>
    </>
  )
}
