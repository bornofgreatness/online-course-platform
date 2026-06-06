'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, {
  siteCardClass,
  sitePrimaryBtnClass,
  siteMutedClass,
  siteTitleClass,
} from '../../../components/PageShell'
import PageLoading from '../../../components/PageLoading'
import LoadingButtonLabel from '../../../components/LoadingButtonLabel'
import { useI18n } from '../../../components/LanguageProvider'

function VerifyEmailInner() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError(t('auth.missingVerifyToken'))
  }, [token, t])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('auth.verifyFailed'))
        return
      }
      setDone(true)
      setTimeout(() => router.push('/auth/signin'), 1200)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <>
        <Header />
        <PageShell centered>
          <div className={`${siteCardClass} p-8 text-center`}>
            <div className="mb-3 text-4xl text-emerald-600">✓</div>
            <h1 className="text-xl font-bold text-blue-950">{t('auth.emailVerified')}</h1>
            <p className={`${siteMutedClass} mt-2`}>{t('auth.resetRedirect')}</p>
          </div>
        </PageShell>
      </>
    )
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={onSubmit}>
            <h1 className={`${siteTitleClass} mb-6 text-center`}>{t('auth.verifyEmailTitle')}</h1>
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading || !token}
              aria-busy={loading}
              className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-80`}
            >
              <LoadingButtonLabel loading={loading} label={t('common.loading')}>
                {t('auth.verifyEmailButton')}
              </LoadingButtonLabel>
            </button>
            <p className="mt-4 text-center text-sm">
              <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                {t('auth.backToSignIn')}
              </Link>
            </p>
          </form>
        </div>
      </PageShell>
    </>
  )
}

function VerifyEmailFallback() {
  const { t } = useI18n()
  return <PageLoading centered label={t('common.loading')} />
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailInner />
    </Suspense>
  )
}
