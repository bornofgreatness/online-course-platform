import Header from '../../components/Header'
import CategoriesView from '../../components/views/CategoriesView'
import { getBrowseCategories } from '../../lib/categories/getBrowseCategories'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Categorias de cursos | Course categories',
  description:
    'Navegue por categorias de cursos online com certificado. Browse online course categories with digital certificates.',
  path: '/categories',
  seoAlternates: true,
})

export default async function CategoriesPage() {
  const categories = await getBrowseCategories()

  return (
    <>
      <Header />
      <CategoriesView categories={categories} />
    </>
  )
}
