'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingButtonLabel from './LoadingButtonLabel'
import { useI18n } from './LanguageProvider'
import { sitePrimaryBtnClass } from '../lib/ui/siteStyles'

type CertificateRequestButtonProps = {
  courseId: string
  feeLabel: string
  disabled?: boolean
  disabledReason?: string
  onSuccess?: () => void
  className?: string
}

export default function CertificateRequestButton({
  courseId,
  feeLabel,
  disabled = false,
  disabledReason,
  onSuccess,
  className = '',
}: CertificateRequestButtonProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const issueCertificate = async (): Promise<boolean> => {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      onSuccess?.()
      router.refresh()
      return true
    }
    if (res.status === 402) return false
    alert((data as { error?: string }).error || t('actions.failedGenerateCertificate'))
    return false
  }

  const handleClick = async () => {
    if (disabled) return
    setLoading(true)
    try {
      const checkoutRes = await fetch('/api/billing/certificate-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const checkoutData = await checkoutRes.json().catch(() => ({}))

      if (!checkoutRes.ok) {
        alert((checkoutData as { error?: string }).error || t('actions.failedGenerateCertificate'))
        return
      }

      if (checkoutData.paymentRequired === true && checkoutData.url) {
        window.location.href = checkoutData.url as string
        return
      }

      if (checkoutData.paymentRequired === false || checkoutData.alreadyPaid === true) {
        const issued = await issueCertificate()
        if (!issued) alert(t('certificate.paymentConfirmFailed'))
        return
      }

      alert(t('actions.failedGenerateCertificate'))
    } catch {
      alert(t('actions.errorGeneratingCertificate'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {disabledReason ? (
        <p className="mb-2 text-xs text-amber-800">{disabledReason}</p>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        aria-busy={loading}
        className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <LoadingButtonLabel loading={loading} label={t('common.loading')}>
          {t('actions.requestCertificate', { fee: feeLabel })}
        </LoadingButtonLabel>
      </button>
    </div>
  )
}
