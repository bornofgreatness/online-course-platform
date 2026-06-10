'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Header from '../../components/Header'
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
        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/90 to-slate-100 px-4 pb-10 pt-4 lg:px-8">
          <CertificateShowcase />
        </div>
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
