'use client'

import Link from 'next/link'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../PageShell'
import { useI18n } from '../LanguageProvider'

export type VerifyData =
  | {
      valid: true
      certificateNumber: string
      courseName: string
      workloadHours: number
      issuedAt: string
      holderName: string
    }
  | { valid: false }

export default function VerifyCertificateView({
  num,
  data,
}: {
  num: string
  data: VerifyData
}) {
  const { t, language } = useI18n()

  const locale = language === 'pt' ? 'pt-BR' : 'en-US'

  return (
    <PageShell>
      <h1 className={siteTitleClass}>{t('verify.title')}</h1>
      <p className={`${siteMutedClass} mt-2 max-w-2xl`}>{t('verify.subtitle')}</p>

      <div className={`${siteCardClass} mx-auto mt-8 max-w-xl p-6`}>
        {!num ? (
          <p className={siteMutedClass}>{t('verify.missingNumber')}</p>
        ) : !data.valid ? (
          <p className="font-semibold text-red-700">{t('verify.invalid')}</p>
        ) : (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.status')}</dt>
              <dd className="font-semibold text-emerald-700">{t('verify.valid')}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.certNumber')}</dt>
              <dd className="font-mono text-slate-900">{data.certificateNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.learner')}</dt>
              <dd className="text-slate-900">{data.holderName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.course')}</dt>
              <dd className="text-slate-900">{data.courseName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.workload')}</dt>
              <dd className="text-slate-900">{t('verify.hours', { hours: data.workloadHours })}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('verify.issued')}</dt>
              <dd className="text-slate-900">{new Date(data.issuedAt).toLocaleString(locale)}</dd>
            </div>
          </dl>
        )}
      </div>

      <p className="mt-8">
        <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:underline">
          ← {t('common.courses')}
        </Link>
      </p>
    </PageShell>
  )
}
