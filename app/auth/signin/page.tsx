'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteTitleClass } from '../../../components/PageShell'
import LoadingImage from '../../../components/LoadingImage'
import { useI18n } from '../../../components/LanguageProvider'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-slate-700'

export default function SignIn() {
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setNeedsVerification(false)
    setResendMessage(null)

    let success = false
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        success = true
        router.push('/dashboard')
        return
      }

      const err = result?.error || ''
      if (err === 'Email not verified' || err.includes('not verified')) {
        setNeedsVerification(true)
        setErrorMessage(t('auth.emailNotVerified'))
      } else if (err === 'CredentialsSignin') {
        setErrorMessage(t('auth.wrongCredentials'))
      } else {
        setErrorMessage(err || t('auth.signInFailed'))
      }
    } finally {
      if (!success) setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setResendMessage(t('auth.enterEmailAbove'))
      return
    }

    setResendMessage(t('common.saving'))

    const res = await fetch('/api/auth/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json().catch(() => null)

    if (res.ok) {
      if (data?.verifyUrl) {
        setResendMessage(`${t('auth.verificationDevLink')} ${data.verifyUrl}`)
      } else {
        setResendMessage(t('auth.verificationSent'))
      }
    } else {
      setResendMessage(data?.error || t('common.error'))
    }
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={handleSubmit}>
            <h1 className={`${siteTitleClass} mb-6 text-center`}>{t('common.login')}</h1>

            <div className="mb-4">
              <label className={labelClass}>{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="mb-6">
              <label className={labelClass}>{t('common.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <LoadingImage inline size="xs" color="white" label={t('common.loading')} />
              ) : (
                t('common.login')
              )}
            </button>

            {errorMessage && <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>}

            {needsVerification && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t('auth.resendVerification')}
                </button>
              </div>
            )}

            {resendMessage && (
              <div className="mt-4 break-words text-center text-sm text-slate-700">{resendMessage}</div>
            )}

            <div className="mt-4 flex flex-col items-center gap-2">
              <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
              <p className="text-center text-sm text-slate-600">
                {t('auth.noAccount')}{' '}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:underline">
                  {t('common.signupFree')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </PageShell>
    </>
  )
}
