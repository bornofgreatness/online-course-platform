'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteTitleClass } from '../../../components/PageShell'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-slate-700'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json().catch(() => null)
    if (res.ok) {
      if (data?.verifyUrl) {
        setVerifyUrl(data.verifyUrl)
        setMessage('Registration succeeded. Use the verification link below to verify your email.')
      } else {
        router.push('/auth/signin')
      }
    } else {
      setMessage(data?.error || 'Registration failed')
    }
  }

  return (
    <>
      <Header />
      <PageShell centered>
        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <form onSubmit={handleSubmit}>
            <h1 className={`${siteTitleClass} mb-6 text-center`}>Sign up</h1>
            <div className="mb-4">
              <label className={labelClass}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign up
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
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
              <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </PageShell>
    </>
  )
}
