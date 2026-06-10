import Header from '../components/Header'
import CategoriesView from '../components/views/CategoriesView'
import { getBrowseCategories } from '../lib/categories/getBrowseCategories'
import { buildPageMetadata } from '../lib/seo/metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Cursos online com certificado rápido | Online courses with certificate',
  description:
    'CONECT CURSOS — plataforma de cursos online baratos com certificado digital / affordable online courses with fast digital certificates. EaD, 100 hours, Brazil.',
  path: '/',
  seoAlternates: true,
})

export default async function Home() {
  const categories = await getBrowseCategories()

  return (
    <>
      <Header />
      <CategoriesView categories={categories} />
    </>
  )
}
