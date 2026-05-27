import Header from '../../components/Header'
import BlogView from '../../components/views/BlogView'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Blog — dicas de cursos online e certificados',
  description:
    'Dicas para turbinar o currículo, certificados digitais, horas complementares e cursos online com certificado. CONECT CURSOS.',
  path: '/blog',
})

export default function BlogPage() {
  return (
    <>
      <Header />
      <BlogView />
    </>
  )
}
