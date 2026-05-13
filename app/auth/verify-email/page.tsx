'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'

function VerifyEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError('Missing token')
  }, [token])

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
        setError(data.error || 'Failed to verify email')
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
            <h1 className="text-xl font-bold text-blue-950">Email verified</h1>
            <p className={`${siteMutedClass} mt-2`}>Redirecting to sign in…</p>
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
            <h1 className={`${siteTitleClass} mb-6 text-center`}>Verify email</h1>
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
            <p className="mt-4 text-center text-sm">
              <Link href="/auth/signin" className="font-semibold text-blue-600 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </PageShell>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <PageShell centered>
            <p className="text-center text-slate-600">Loading…</p>
          </PageShell>
        </>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  )
}
