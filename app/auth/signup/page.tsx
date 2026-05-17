'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteTitleClass } from '../../../components/PageShell'
import { useI18n } from '../../../components/LanguageProvider'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-slate-700'

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export default function SignUp() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) setReferralCode(ref.trim())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        whatsapp,
        address,
        city,
        state,
        referralCode: referralCode || undefined,
      }),
    })

    const data = await res.json().catch(() => null)
    if (res.ok) {
      if (data?.verifyUrl) {
        setVerifyUrl(data.verifyUrl)
        setMessage(t('auth.signupSuccess'))
      } else {
        router.push('/auth/signin')
      }
    } else {
      setMessage(data?.error || t('auth.signupFailed'))
    }
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={handleSubmit}>
            <h1 className={`${siteTitleClass} mb-2 text-center`}>{t('auth.signupTitle')}</h1>
            <p className="mb-6 text-center text-sm text-slate-600">{t('auth.signupSubtitle')}</p>

            <fieldset className="mb-6 space-y-4">
              <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t('auth.personalData')}
              </legend>
              <div>
                <label className={labelClass}>{t('auth.fullName')}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('auth.whatsapp')}</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClass}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>{t('common.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('common.password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
              </div>
            </fieldset>

            <fieldset className="mb-6 space-y-4">
              <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t('auth.addressSection')}
              </legend>
              <div>
                <label className={labelClass}>{t('auth.fullAddress')}</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t('auth.city')}</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{t('auth.state')}</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass} required>
                    <option value="">{t('common.select')}</option>
                    {BRAZIL_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t('common.signupFreeCta')}
            </button>

            {message && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {message}
                {verifyUrl && (
                  <div className="mt-2 break-words">
                    <a href={verifyUrl} className="font-semibold text-blue-600 hover:underline">
                      {verifyUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-center text-sm text-slate-600">
                {t('auth.haveAccount')}{' '}
                <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                  {t('common.login')}
                </Link>
              </p>
              <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </form>
        </div>
      </PageShell>
    </>
  )
}
