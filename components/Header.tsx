'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session, status } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="text-lg font-semibold">
          <Link href="/" className="hover:text-blue-600">
            Online Course Platform
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <span className="text-gray-500">Loading...</span>
          ) : session ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-lg border border-blue-500 px-4 py-2 text-blue-500 transition hover:bg-blue-50"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/courses" className="text-blue-500 hover:underline">
            Courses
          </Link>
          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className="text-blue-500 hover:underline">
                Dashboard
              </Link>
              <Link href="/certificates" className="text-blue-500 hover:underline">
                Certificates
              </Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin" className="text-blue-500 hover:underline">
                  Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}