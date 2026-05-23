'use client'

import Link from 'next/link'
import Header from './Header'
import PricingPlans from './PricingPlans'
import WhatsAppFloat from './WhatsAppButton'
import { countCatalogCourses, PLATFORM_CATALOG } from '../lib/platformCatalog'
import { useI18n } from './LanguageProvider'
import { CATEGORY_NAME_KEYS, type TranslationKey } from '../lib/i18n/translations'
import CertificateShowcase from './CertificateShowcase'

function catalogDisplayName(name: string, t: (k: TranslationKey) => string) {
  const key = CATEGORY_NAME_KEYS[name]
  return key ? t(key) : name
}

export default function LandingPage() {
  const { t } = useI18n()
  const totalCourses = countCatalogCourses()

  const testimonials = [
    { name: 'Mariana S.', roleKey: 'landing.testimonial1role' as const, textKey: 'landing.testimonial1' as const },
    { name: 'Carlos R.', roleKey: 'landing.testimonial2role' as const, textKey: 'landing.testimonial2' as const },
    { name: 'Ana Paula L.', roleKey: 'landing.testimonial3role' as const, textKey: 'landing.testimonial3' as const },
  ]

  const faqs = [
    { qKey: 'landing.faq1q' as const, aKey: 'landing.faq1a' as const },
    { qKey: 'landing.faq2q' as const, aKey: 'landing.faq2a' as const },
    { qKey: 'landing.faq3q' as const, aKey: 'landing.faq3a' as const },
    { qKey: 'landing.faq4q' as const, aKey: 'landing.faq4a' as const },
  ]

  const stats = [
    { n: '7', labelKey: 'landing.statsCategories' as const },
    { n: '30+', labelKey: 'landing.statsSubcategories' as const },
    { n: `${totalCourses}+`, labelKey: 'landing.statsCourses' as const },
    { n: '100h', labelKey: 'landing.statsCertificate' as const },
  ]

  return (
    <>
      <Header />
      <WhatsAppFloat />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">
            {t('landing.heroBadge', { count: totalCourses })}
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-blue-100">{t('landing.heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg transition hover:bg-teal-50"
            >
              {t('common.signupFreeCta')}
            </Link>
            <Link
              href="/courses"
              className="rounded-full border-2 border-white/80 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              {t('common.browseCourses')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('landing.categoriesTitle')}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{t('landing.categoriesSubtitle')}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_CATALOG.map((cat) => {
            const courseCount = cat.subcategories.reduce((n, s) => n + s.courses.length, 0)
            return (
              <Link
                key={cat.name}
                href="/categories"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imageUrl}
                  alt=""
                  className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                />
                <div className="p-5">
                  <h3 className="font-bold text-slate-900">{catalogDisplayName(cat.name, t)}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('landing.subcategoriesCourses', {
                      subs: cat.subcategories.length,
                      courses: courseCount,
                    })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
          {stats.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="text-3xl font-bold text-blue-900">{s.n}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="certificados"
        className="relative overflow-hidden border-y border-teal-200/60 bg-gradient-to-b from-teal-50/90 via-emerald-50/40 to-white py-16 lg:py-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(30, 58, 138, 0.08) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <CertificateShowcase linkToCertificatesPage />
        </div>
      </section>

      <section
        id="planos"
        className="relative overflow-hidden border-t border-blue-200/50 bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-50/30 py-16 lg:py-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 25%, transparent 25%), linear-gradient(225deg, rgba(59, 130, 246, 0.06) 25%, transparent 25%)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {t('landing.pricingEyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{t('landing.pricingTitle')}</h2>
            <p className="mt-2 text-slate-600">{t('landing.pricingSubtitle')}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-blue-100/80 backdrop-blur-sm sm:p-6">
            <PricingPlans />
          </div>
        </div>
      </section>

      <section className="bg-blue-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('landing.testimonialsTitle')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm leading-relaxed text-blue-50">&ldquo;{t(item.textKey)}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold text-teal-200">
                  {item.name} — {t(item.roleKey)}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6">
        <h2 className="text-2xl font-bold text-slate-900">{t('landing.ctaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{t('landing.ctaSubtitle')}</p>
        <Link
          href="/auth/signup"
          className="mt-6 inline-block rounded-full bg-blue-600 px-10 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700"
        >
          {t('common.signupFree')}
        </Link>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t('landing.faqTitle')}</h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((f) => (
              <div key={f.qKey}>
                <dt className="font-semibold text-slate-900">{t(f.qKey)}</dt>
                <dd className="mt-2 text-sm text-slate-600">{t(f.aKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-bold text-slate-900">{t('landing.contactTitle')}</h2>
        <p className="mt-2 text-slate-600">{t('landing.contactSubtitle')}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            {t('common.whatsapp')}
          </a>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t('common.signupFreeCta')}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
        <p className="mt-2">
          <Link href="/courses" className="text-blue-600 hover:underline">
            {t('common.courses')}
          </Link>
          {' · '}
          <Link href="/pricing" className="text-blue-600 hover:underline">
            {t('common.prices')}
          </Link>
          {' · '}
          <Link href="/blog" className="text-blue-600 hover:underline">
            {t('common.blog')}
          </Link>
        </p>
      </footer>
    </>
  )
}
