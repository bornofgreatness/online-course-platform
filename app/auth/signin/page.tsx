'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, {
  siteCardClass,
  siteInputClass,
  siteLabelClass,
  sitePrimaryBtnClass,
  siteTitleClass,
} from '../../../components/PageShell'
import LoadingButtonLabel from '../../../components/LoadingButtonLabel'
import { useI18n } from '../../../components/LanguageProvider'

export default function SignIn() {
  const { t } = useI18n()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
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
    setResendLoading(true)

    try {
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
    } finally {
      setResendLoading(false)
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
              <label className={siteLabelClass}>{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={siteInputClass}
                required
              />
            </div>

            <div className="mb-6">
              <label className={siteLabelClass}>{t('common.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={siteInputClass}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-80`}
            >
              <LoadingButtonLabel loading={loading} label={t('common.loading')}>
                {t('common.login')}
              </LoadingButtonLabel>
            </button>

            {errorMessage && <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>}

            {needsVerification && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  disabled={resendLoading}
                  aria-busy={resendLoading}
                  onClick={handleResend}
                  className={`min-w-[10rem] ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-80`}
                >
                  <LoadingButtonLabel loading={resendLoading} label={t('common.loading')}>
                    {t('auth.resendVerification')}
                  </LoadingButtonLabel>
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
