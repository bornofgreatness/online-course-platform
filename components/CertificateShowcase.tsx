'use client'

import Link from 'next/link'
import { useI18n } from './LanguageProvider'
import { siteCardClass, siteMutedClass } from './PageShell'
import { formatCertificateFeeBrl } from '../lib/certificatePolicy'

function StepCard({ step, text }: { step: number; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15 sm:rounded-2xl sm:p-6">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-teal-200 sm:text-xs">
        {step}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white sm:mt-3 sm:text-base">{text}</p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className={`${siteCardClass} flex gap-3 p-4 transition hover:shadow-lg sm:gap-4 sm:p-6`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-lg text-white shadow-md sm:h-12 sm:w-12 sm:rounded-xl sm:text-xl">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-blue-950 sm:text-base">{title}</h3>
        <p className={`${siteMutedClass} mt-1 text-sm leading-relaxed`}>{description}</p>
      </div>
    </div>
  )
}

type Props = {
  /** Show link to full /certificates page (homepage). */
  linkToCertificatesPage?: boolean
  className?: string
}

export default function CertificateShowcase({ linkToCertificatesPage = false, className = '' }: Props) {
  const { t, language } = useI18n()
  const feeLabel = formatCertificateFeeBrl(language === 'pt' ? 'pt-BR' : 'en-US')

  const steps = [
    t('certificate.howToEarnStep1'),
    t('certificate.howToEarnStep2'),
    t('certificate.howToEarnStep3', { fee: feeLabel }),
  ]

  return (
    <div className={className}>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 px-4 py-10 text-white shadow-xl sm:rounded-3xl sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl"
          aria-hidden
        />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
          {t('certificate.heroBadge')}
        </p>
        <h2 className="relative mt-3 max-w-2xl text-2xl font-bold leading-tight sm:mt-4 sm:text-4xl lg:text-[2.75rem]">
          {linkToCertificatesPage ? t('certificate.sectionTitle') : t('certificate.pageTitlePublic')}
        </h2>
        <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-blue-100 sm:mt-5 sm:text-lg">
          {t('certificate.pageSubtitlePublic')}
        </p>
        <div className="relative mt-6 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {steps.map((text, i) => (
            <StepCard key={i} step={i + 1} text={text} />
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
        <FeatureCard
          icon="✓"
          title={t('certificate.featureValidity')}
          description={t('certificate.featureValidityDesc')}
        />
        <FeatureCard
          icon="🔍"
          title={t('certificate.featureVerify')}
          description={t('certificate.featureVerifyDesc')}
        />
        <FeatureCard
          icon="💳"
          title={t('certificate.featureFee')}
          description={t('certificate.featureFeeDesc', { fee: feeLabel })}
        />
      </section>

      <section className={`${siteCardClass} mt-6 overflow-hidden sm:mt-10`}>
        <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-4 sm:px-8 sm:py-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-teal-800 sm:text-xs">
            {t('certificate.brandName')}
          </p>
          <h3 className="mt-1 text-lg font-bold text-blue-950 sm:text-2xl">
            {t('certificate.sectionTitle')}
          </h3>
        </div>
        <div className="space-y-4 px-4 py-5 text-sm leading-relaxed text-slate-700 sm:px-8 sm:py-8 sm:text-base">
          <p>{t('certificate.legalIntro')}</p>
          <p>{t('certificate.legalAfterAssessment')}</p>
          <div className="rounded-xl border-l-4 border-teal-600 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4">
            <p className="font-semibold text-slate-900">{t('certificate.legalClassificationTitle')}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>{t('certificate.legalLaw9394')}</li>
              <li>{t('certificate.legalDecree5154')}</li>
            </ul>
          </div>
          <p>{t('certificate.legalValidity')}</p>
          <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-teal-700 to-blue-800 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:gap-4 sm:px-6 sm:py-5">
            <p className="text-sm font-semibold sm:text-base">{t('certificate.legalFee', { fee: feeLabel })}</p>
            <span className="inline-flex w-full items-center justify-center rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur sm:w-fit sm:py-1.5">
              {feeLabel}
            </span>
          </div>
        </div>
      </section>

      {/* <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-6 text-center sm:px-8">
        <p className={`${siteMutedClass} text-sm leading-relaxed`}>{t('certificate.verifyHint')}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {linkToCertificatesPage && (
            <Link
              href="/certificates"
              className="inline-flex items-center justify-center rounded-full border-2 border-blue-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-700 transition hover:bg-blue-50"
            >
              {t('certificate.learnMore')}
            </Link>
          )}
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            {t('common.browseCourses')}
          </Link>
        </div>
      </section> */}
    </div>
  )
}
