'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EnrollButton from './EnrollButton'

interface CourseActionsProps {
  courseId: string
  isEnrolled: boolean
  progress: { completed: boolean; lastPage: number }
  hasCertificate: boolean
}

export default function CourseActions({ courseId, isEnrolled, progress, hasCertificate }: CourseActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMarkComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          progress: { completed: true, lastPage: progress.lastPage }
        })
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to mark course as complete')
      }
    } catch (error) {
      alert('Error updating progress')
    }
    setLoading(false)
  }

  const handleGenerateCertificate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to generate certificate')
      }
    } catch (error) {
      alert('Error generating certificate')
    }
    setLoading(false)
  }

  if (!isEnrolled) {
    return <EnrollButton courseId={courseId} />
  }

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-medium">Progress:</span> {progress.completed ? 'Completed' : 'In Progress'}
      </div>

      {hasCertificate ? (
        <div className="text-center">
          <div className="text-green-600 font-semibold mb-2">✓ Certificate Earned!</div>
          <a
            href="/certificates"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm inline-block"
          >
            View Certificate
          </a>
        </div>
      ) : progress.completed ? (
        <button
          onClick={handleGenerateCertificate}
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Generating...' : 'Generate Certificate'}
        </button>
      ) : (
        <button
          onClick={handleMarkComplete}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Updating...' : 'Mark as Complete'}
        </button>
      )}
    </div>
  )
}