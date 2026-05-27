import type { ReactNode } from 'react'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Catálogo de cursos online | Online course catalog',
  description:
    'Cursos online rápidos com certificado / Fast online courses with certificate. TI, administração, saúde, marketing. CONECT CURSOS EaD platform.',
  path: '/courses',
})

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return children
}
