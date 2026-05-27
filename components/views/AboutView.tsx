'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '../LanguageProvider'
import type { TranslationKey } from '../../lib/i18n/translations'

type AboutSection = {
  titleKey: TranslationKey
  bodyKey: TranslationKey
  variant?: 'default' | 'partnership' | 'courses'
}

const SECTIONS: AboutSection[] = [
  { titleKey: 'about.section1Title', bodyKey: 'about.section1' },
  { titleKey: 'about.section2Title', bodyKey: 'about.section2' },
  { titleKey: 'about.section3Title', bodyKey: 'about.section3', variant: 'partnership' },
  { titleKey: 'about.section4Title', bodyKey: 'about.section4', variant: 'courses' },
  { titleKey: 'about.section5Title', bodyKey: 'about.section5' },
]

const COURSE_TAGS: TranslationKey[] = [
  'about.tagInformatica',
  'about.tagVocational',
  'about.tagEnglish',
  'about.tagLibras',
  'about.tagMore',
]

const STATS = [
  { value: '318 km', labelKey: 'about.statDistance' as const },
  { value: '2023', labelKey: 'about.statFounded' as const },
  { value: 'Serrolândia', labelKey: 'about.statHq' as const },
  { value: 'CIBT · ADEB', labelKey: 'about.statPartners' as const },
]

const SECTION_NUMBER_STYLES = [
  'bg-blue-600 text-white shadow-md shadow-blue-600/30',
  'bg-teal-600 text-white shadow-md shadow-teal-600/30',
  'bg-violet-600 text-white shadow-md shadow-violet-600/30',
  'bg-amber-500 text-white shadow-md shadow-amber-500/30',
  'bg-rose-600 text-white shadow-md shadow-rose-600/30',
] as const

export default function AboutView() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 md:px-6 lg:py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200 sm:text-sm">
                {t('about.heroBadge')}
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {t('about.title')}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-blue-100/95 sm:text-lg">
                {t('about.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg transition hover:bg-teal-50"
                >
                  {t('common.browseCourses')}
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-full border-2 border-white/70 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
                >
                  {t('common.prices')}
                </Link>
              </div>
            </div>
            <div className="flex shrink-0 justify-center lg:justify-end">
              <div className="relative rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-sm">
                <Image
                  src="/logo.jpg"
                  alt={t('certificate.brandName')}
                  width={200}
                  height={200}
                  className="h-32 w-32 rounded-xl object-contain bg-white p-2 shadow-2xl sm:h-40 sm:w-40"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-8 mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.labelKey}
              className="rounded-2xl border border-slate-200/80 bg-white px-4 py-5 text-center shadow-lg shadow-slate-200/50 ring-1 ring-black/5 sm:px-5 sm:py-6"
            >
              <p className="text-xl font-bold text-blue-950 sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story sections */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="space-y-5 sm:space-y-6">
          {SECTIONS.map((section, index) => {
            const isPartnership = section.variant === 'partnership'
            const isCourses = section.variant === 'courses'

            return (
              <article
                key={section.bodyKey}
                className={[
                  'group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-8',
                  isPartnership
                    ? 'border-teal-200/80 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/40'
                    : 'border-slate-200/80',
                ].join(' ')}
              >
                <div className="flex gap-5 sm:gap-6">
                  <div
                    className={[
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold sm:h-12 sm:w-12 sm:text-base',
                      SECTION_NUMBER_STYLES[index],
                    ].join(' ')}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{t(section.titleKey)}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
                      {t(section.bodyKey)}
                    </p>

                    {isPartnership && (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold text-teal-800 sm:text-sm">
                        <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden />
                        {t('about.partnershipNote')}
                      </p>
                    )}

                    {isCourses && (
                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('about.coursesIntro')}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {COURSE_TAGS.map((tagKey) => (
                            <li
                              key={tagKey}
                              className="rounded-full bg-blue-950/5 px-3.5 py-1.5 text-xs font-semibold text-blue-900 ring-1 ring-blue-950/10 sm:text-sm"
                            >
                              {t(tagKey)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 px-6 py-10 text-center text-white shadow-xl sm:px-10 sm:py-14">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.15),transparent_50%)]"
              aria-hidden
            />
            <div className="relative">
              <h2 className="text-2xl font-bold sm:text-3xl">{t('about.ctaTitle')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 sm:text-base">{t('about.ctaSubtitle')}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/courses"
                  className="rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 transition hover:bg-teal-50"
                >
                  {t('common.browseCourses')}
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  ← {t('common.backToHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
