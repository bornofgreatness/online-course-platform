'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      redirect: false
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
      body: JSON.stringify({ email })
    })
    const data = await res.json().catch(() => null)
    if (res.ok) {
      setResendMessage(data?.verifyUrl ? 'Verification email sent. Check your inbox or use the link below.' : 'Verification email sent. Check your inbox.')
      if (data?.verifyUrl) {
        setErrorMessage(null)
        setResendMessage(
          `Verification link: ${data.verifyUrl}`
        )
      }
    } else {
      setResendMessage(data?.error || 'Failed to resend verification email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Sign In
        </button>
        {errorMessage && (
          <div className="mt-4 text-center text-sm text-red-600">{errorMessage}</div>
        )}
        {errorMessage === 'Email not verified' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Resend verification email
            </button>
          </div>
        )}
        {resendMessage && (
          <div className="mt-4 text-center text-sm text-gray-700 break-words">{resendMessage}</div>
        )}
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link href="/auth/forgot-password" className="text-blue-500 hover:underline text-sm">
            Forgot password?
          </Link>
          <p className="text-center text-sm">
            Do not have an account? <Link href="/auth/signup" className="text-blue-500 hover:underline">Sign Up</Link>
          </p>
        </div>

      </form>
    </div>
  )
}