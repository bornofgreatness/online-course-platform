'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import { useI18n } from '../../../components/LanguageProvider'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-slate-700'

function ResetPasswordInner() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError(t('auth.missingToken'))
  }, [token, t])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t('auth.resetFailed'))
        return
      }
      setDone(true)
      setTimeout(() => router.push('/auth/signin'), 1500)
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
            <h1 className="text-xl font-bold text-blue-950">{t('auth.resetSuccess')}</h1>
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
            <h1 className={`${siteTitleClass} mb-6 text-center`}>{t('auth.resetPasswordTitle')}</h1>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <div className="mb-4">
              <label className={labelClass}>{t('auth.newPassword')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('actions.updating') : t('auth.resetPasswordTitle')}
            </button>

            <p className="mt-4 text-center text-sm">
              <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                {t('common.login')}
              </Link>
            </p>
          </form>
        </div>
      </PageShell>
    </>
  )
}

export default function ResetPasswordPage() {
  const { t } = useI18n()
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <PageShell centered>
            <p className="text-center text-slate-600">{t('common.loading')}</p>
          </PageShell>
        </>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}
