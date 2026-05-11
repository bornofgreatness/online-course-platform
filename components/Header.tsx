'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session, status } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="flex flex-col gap-4 p-4 bg-white shadow md:flex-row md:items-center md:justify-between">
      <div className="text-lg font-semibold">
        <Link href="/" className="hover:text-blue-600">
          Online Course Platform
        </Link>
      </div>
      <nav className="flex flex-wrap items-center gap-4">
        <Link href="/courses" className="text-blue-500 hover:underline">
          Courses
        </Link>

        {status === 'loading' ? (
          <span className="text-gray-500">Loading...</span>
        ) : session ? (
          // Logged in navigation
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
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          // Not logged in navigation
          <>
            <Link href="/auth/signin" className="text-blue-500 hover:underline">
              Sign In
            </Link>
            <Link href="/auth/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}