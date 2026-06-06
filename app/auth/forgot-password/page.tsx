'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, {
  siteCardClass,
  siteInputClass,
  siteLabelClass,
  sitePrimaryBtnClass,
  siteMutedClass,
  siteTitleClass,
} from '../../../components/PageShell'
import LoadingButtonLabel from '../../../components/LoadingButtonLabel'
import { useI18n } from '../../../components/LanguageProvider'

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={onSubmit}>
            <h1 className={`${siteTitleClass} mb-6 text-center`}>{t('auth.forgotPasswordTitle')}</h1>

            {sent ? (
              <div className="text-center">
                <div className="mb-3 text-4xl text-emerald-600">✓</div>
                <p className={siteMutedClass}>{t('auth.forgotPasswordSent')}</p>
                <Link href="/auth/signin" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:underline">
                  {t('common.login')}
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className={siteLabelClass}>{t('common.email')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={siteInputClass} required />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className={`w-full ${sitePrimaryBtnClass} disabled:cursor-not-allowed disabled:opacity-80`}
                >
                  <LoadingButtonLabel loading={loading} label={t('common.loading')}>
                    {t('auth.sendResetLink')}
                  </LoadingButtonLabel>
                </button>

                <p className="mt-4 text-center text-sm text-slate-600">
                  <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                    {t('common.login')}
                  </Link>
                </p>
              </>
            )}
          </form>
        </div>
      </PageShell>
    </>
  )
}
