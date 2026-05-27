import type { ReactNode } from 'react'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Certificado digital rápido | Fast digital certificate',
  description:
    'Certificado digital na hora / Instant digital certificate after course completion. Valid in Brazil, online verification, 100 hours. CONECT CURSOS.',
  path: '/certificates',
})

export default function CertificatesLayout({ children }: { children: ReactNode }) {
  return children
}
