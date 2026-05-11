'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

interface Certificate {
  id: string
  certificateNumber: string
  issuedAt: string
  pdfUrl: string
  qrCode: string
  course: {
    title: string
    description: string
  }
}

export default function Certificates() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data.certificates || [])
      })
      .finally(() => setLoading(false))
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen p-8">Loading...</div>
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-gray-600 mt-2">View and download your course completion certificates.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-semibold mb-2">No certificates yet</h2>
          <p className="text-gray-600 mb-6">Complete a course to earn your first certificate!</p>
          <Link href="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="text-lg font-semibold">{certificate.course.title}</h3>
                <p className="text-sm text-gray-600">Certificate #{certificate.certificateNumber}</p>
              </div>

              <div className="mb-4">
                <img
                  src={certificate.qrCode}
                  alt="Certificate QR Code"
                  className="w-20 h-20 mx-auto"
                />
              </div>

              <div className="text-center text-sm text-gray-500 mb-4">
                Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(certificate.pdfUrl, '_blank')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: `Certificate for ${certificate.course.title}`,
                      text: `I completed the course: ${certificate.course.title}`,
                      url: window.location.origin + certificate.pdfUrl
                    })
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm"
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}
