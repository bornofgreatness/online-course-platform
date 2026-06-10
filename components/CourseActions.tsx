'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import EnrollButton from './EnrollButton'
import CertificateLegalNotice from './CertificateLegalNotice'
import { useI18n } from './LanguageProvider'
import LoadingButtonLabel from './LoadingButtonLabel'
import LoadingImage from './LoadingImage'
import { siteAccentBtnClass, sitePrimaryBtnClass } from '../lib/ui/siteStyles'
import { CERTIFICATE_ISSUANCE_FEE_BRL, formatCertificateFeeBrl } from '../lib/certificatePolicy'

interface CourseActionsProps {
  courseId: string
  isEnrolled: boolean
  /** True when enrolled but subscription is missing/expired (non-admin). */
  subscriptionBlocked: boolean
  progress: { completed: boolean; lastPage: number }
  hasCertificate: boolean
  quizExists: boolean
  quizPassed: boolean
}

export default function CourseActions({
  courseId,
  isEnrolled,
  subscriptionBlocked,
  progress,
  hasCertificate,
  quizExists,
  quizPassed: initialQuizPassed,
}: CourseActionsProps) {
  const [loading, setLoading] = useState(false)
  const [quizPassed, setQuizPassed] = useState(initialQuizPassed)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const { t, language } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleQuizPassed = (event: CustomEvent<{ courseId: string }>) => {
      if (event.detail.courseId === courseId) {
        setQuizPassed(true)
      }
    }

    window.addEventListener('quiz-passed', handleQuizPassed as EventListener)
    return () => {
      window.removeEventListener('quiz-passed', handleQuizPassed as EventListener)
    }
  }, [courseId])

  useEffect(() => {
    const checkout = searchParams.get('certificate')
    const paymentId = searchParams.get('payment_id')
    if (checkout !== 'success' || !paymentId) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setCheckoutMessage(t('certificate.confirmingPayment'))
      try {
        const res = await fetch(
          `/api/billing/certificate/confirm?courseId=${encodeURIComponent(courseId)}&payment_id=${encodeURIComponent(paymentId)}`
        )
        const data = await res.json().catch(() => ({}))
        if (!cancelled) {
          if (res.ok) {
            setCheckoutMessage(t('certificate.paymentConfirmed'))
            router.replace(`/courses/${courseId}`, { scroll: false })
            router.refresh()
          } else {
            setCheckoutMessage((data as { error?: string }).error || t('certificate.paymentConfirmFailed'))
          }
        }
      } catch {
        if (!cancelled) setCheckoutMessage(t('certificate.paymentConfirmFailed'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, courseId, router, t])

  const handleMarkComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          progress: { completed: true, lastPage: progress.lastPage },
        }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert((data as { error?: string }).error || t('actions.failedMarkComplete'))
      }
    } catch {
      alert(t('actions.errorUpdatingProgress'))
    }
    setLoading(false)
  }

  const issueCertificateAfterPayment = async (): Promise<boolean> => {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      router.refresh()
      return true
    }
    if (res.status === 402) {
      return false
    }
    alert((data as { error?: string }).error || t('actions.failedGenerateCertificate'))
    return false
  }

  const handleRequestCertificate = async () => {
    setLoading(true)
    setCheckoutMessage(null)
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
        const issued = await issueCertificateAfterPayment()
        if (!issued) {
          alert(t('certificate.paymentConfirmFailed'))
        }
        return
      }

      alert(t('actions.failedGenerateCertificate'))
    } catch {
      alert(t('actions.errorGeneratingCertificate'))
    } finally {
      setLoading(false)
    }
  }

  const feeLabel = formatCertificateFeeBrl(language === 'pt' ? 'pt-BR' : 'en-US')

  if (!isEnrolled) {
    return <EnrollButton courseId={courseId} />
  }

  if (subscriptionBlocked) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-amber-900">{t('actions.subscriptionInactive')}</p>
        <p className="text-slate-600">{t('actions.renewAccess')}</p>
        <Link
          href="/pricing"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t('actions.viewPlans')}
        </Link>
      </div>
    )
  }

  const quizGateActive = quizExists && !quizPassed && !progress.completed
  const canMarkComplete = !quizGateActive && !progress.completed

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-medium">{t('course.progress')}:</span>{' '}
        {progress.completed ? t('course.completed') : t('course.inProgress')}
      </div>

      {loading && checkoutMessage ? (
        <LoadingImage size="sm" label={t('common.loading')} className="py-2" />
      ) : null}

      {checkoutMessage && (
        <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          {checkoutMessage}
        </p>
      )}

      {quizGateActive && (
        <p className="text-sm text-slate-700">{t('actions.passQuizBeforeComplete')}</p>
      )}

      {hasCertificate ? (
        <div className="text-center">
          <div className="mb-2 font-semibold text-green-600">✓ {t('actions.certificateEarned')}</div>
          <a
            href="/certificates?tab=mine"
            className={`inline-block ${siteAccentBtnClass} px-4 py-2 text-sm`}
          >
            {t('actions.viewCertificate')}
          </a>
        </div>
      ) : progress.completed ? (
        <div className="space-y-3">
          <CertificateLegalNotice compact />
          <button
            type="button"
            onClick={handleRequestCertificate}
            disabled={loading}
            aria-busy={loading}
            className={`w-full ${sitePrimaryBtnClass}`}
          >
            <LoadingButtonLabel loading={loading} label={t('common.loading')}>
              {t('actions.requestCertificate', { fee: feeLabel })}
            </LoadingButtonLabel>
          </button>
          <p className="text-center text-xs text-slate-500">
            {t('certificate.feeAmount', { fee: feeLabel, amount: String(CERTIFICATE_ISSUANCE_FEE_BRL) })}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleMarkComplete}
          disabled={loading || !canMarkComplete}
          aria-busy={loading}
          className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <LoadingButtonLabel loading={loading} label={t('common.loading')}>
            {t('course.markComplete')}
          </LoadingButtonLabel>
        </button>
      )}
    </div>
  )
}
