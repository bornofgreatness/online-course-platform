'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useI18n } from './LanguageProvider'
import LoadingButtonLabel from './LoadingButtonLabel'
import { sitePrimaryBtnClass } from '../lib/ui/siteStyles'

interface EnrollButtonProps {
  courseId: string
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const { t } = useI18n()
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
    alert((data as { error?: string }).error || t('course.enrollmentFailed'))
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={isLoading}
      className={`mt-6 min-w-[7rem] ${sitePrimaryBtnClass}`}
    >
      <LoadingButtonLabel loading={isLoading} label={t('common.loading')}>
        {t('course.enroll')}
      </LoadingButtonLabel>
    </button>
  )
}
