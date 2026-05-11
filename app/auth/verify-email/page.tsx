'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-4xl mb-3">✓</div>
          <h1 className="text-xl font-semibold">Email verified</h1>
          <p className="text-gray-600 mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Email</h1>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify email'}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          Loading...
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  )
}

