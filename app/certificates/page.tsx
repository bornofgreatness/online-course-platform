'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Header from '../../components/Header'
import PageShell from '../../components/PageShell'
import PageLoading from '../../components/PageLoading'
import CertificateShowcase from '../../components/CertificateShowcase'
import CertificatesHub from '../../components/CertificatesHub'
import { useI18n } from '../../components/LanguageProvider'

function CertificatesContent() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session

  if (status === 'loading') {
    return <PageLoading />
  }

  return (
    <>
      <Header />
      {isAuthenticated ? (
        <CertificatesHub />
      ) : (
        <PageShell className="mx-auto max-w-6xl">
          <CertificateShowcase />
        </PageShell>
      )}
    </>
  )
}

function CertificatesSuspenseFallback() {
  const { t } = useI18n()
  return <PageLoading label={t('common.loading')} />
}

export default function Certificates() {
  return (
    <Suspense fallback={<CertificatesSuspenseFallback />}>
      <CertificatesContent />
    </Suspense>
  )
}
