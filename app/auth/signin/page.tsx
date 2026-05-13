'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteTitleClass } from '../../../components/PageShell'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-slate-700'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setResendMessage(null)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      setErrorMessage(result?.error || 'Invalid credentials')
    }
  }

  const handleResend = async () => {
    if (!email) {
      setResendMessage('Enter your email address to resend verification.')
      return
    }

    setResendMessage('Sending verification email...')
    const res = await fetch('/api/auth/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => null)
    if (res.ok) {
      setResendMessage(
        data?.verifyUrl ? 'Verification email sent. Check your inbox or use the link below.' : 'Verification email sent. Check your inbox.'
      )
      if (data?.verifyUrl) {
        setErrorMessage(null)
        setResendMessage(`Verification link: ${data.verifyUrl}`)
      }
    } else {
      setResendMessage(data?.error || 'Failed to resend verification email.')
    }
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={handleSubmit}>
            <h1 className={`${siteTitleClass} mb-6 text-center`}>Sign in</h1>
            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Password</label>
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
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </button>
            {errorMessage && <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>}
            {errorMessage === 'Email not verified' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Resend verification email
                </button>
              </div>
            )}
            {resendMessage && <div className="mt-4 break-words text-center text-sm text-slate-700">{resendMessage}</div>}
            <div className="mt-4 flex flex-col items-center gap-2">
              <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <p className="text-center text-sm text-slate-600">
                No account?{' '}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </PageShell>
    </>
  )
}
