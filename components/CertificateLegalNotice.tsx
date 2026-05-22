'use client'

import { useI18n } from './LanguageProvider'
import { formatCertificateFeeBrl } from '../lib/certificatePolicy'

type Props = {
  compact?: boolean
  className?: string
}

export default function CertificateLegalNotice({ compact = false, className = '' }: Props) {
  const { t, language } = useI18n()
  const fee = formatCertificateFeeBrl(language === 'pt' ? 'pt-BR' : 'en-US')

  if (compact) {
    return (
      <p className={`text-xs leading-relaxed text-slate-600 ${className}`}>
        {t('certificate.legalCompact', { fee })}
      </p>
    )
  }

  return (
    <div className={`space-y-3 text-sm leading-relaxed text-slate-700 ${className}`}>
      <p>{t('certificate.legalIntro')}</p>
      <p>{t('certificate.legalAfterAssessment')}</p>
      <p className="font-medium text-slate-900">{t('certificate.legalClassificationTitle')}</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>{t('certificate.legalLaw9394')}</li>
        <li>{t('certificate.legalDecree5154')}</li>
      </ul>
      <p>{t('certificate.legalValidity')}</p>
      <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 font-semibold text-teal-900">
        {t('certificate.legalFee', { fee })}
      </p>
    </div>
  )
}
