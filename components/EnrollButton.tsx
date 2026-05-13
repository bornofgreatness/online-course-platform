'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface EnrollButtonProps {
  courseId: string
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  async function handleEnroll() {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId })
    })

    setIsLoading(false)
    if (res.ok || res.status === 409) {
      router.refresh()
      return
    }
    const data = await res.json().catch(() => ({}))
    alert((data as { error?: string }).error || 'Enrollment failed')
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={isLoading}
      className="mt-6 inline-flex items-center justify-center rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      {isLoading ? 'Enrolling…' : 'Enroll in Course'}
    </button>
  )
}
