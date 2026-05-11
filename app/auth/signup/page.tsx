'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      body: JSON.stringify({ email, password, name })
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
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
          Sign Up
        </button>
        {message && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            {message}
            {verifyUrl && (
              <div className="mt-2 break-words">
                <a href={verifyUrl} className="text-blue-600 hover:underline">
                  {verifyUrl}
                </a>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-center text-sm">
            Already have an account? <Link href="/auth/signin" className="text-blue-500 hover:underline">Sign In</Link>
          </p>
          <Link href="/auth/forgot-password" className="text-blue-500 hover:underline text-sm">
            Forgot password?
          </Link>
        </div>

      </form>
    </div>
  )
}