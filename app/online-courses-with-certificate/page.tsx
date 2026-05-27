import SeoCursosOnlineView from '../../components/views/SeoCursosOnlineView'
import { SEO_FAQ_EN } from '../../lib/seo/faqContent'
import { faqPageJsonLd } from '../../lib/seo/faqJsonLd'
import { buildPageMetadata } from '../../lib/seo/metadata'
import { SEO_LANDING_PATH_EN } from '../../lib/seo/paths'

export const metadata = buildPageMetadata({
  title: 'Online courses with fast affordable certificate',
  description:
    'Online course platform with instant digital certificates. Fast IT, business, health, and marketing courses. Valid in Brazil, complementary hours, 20–100 workload hours. CONECT CURSOS.',
  path: SEO_LANDING_PATH_EN,
  locale: 'en',
  seoAlternates: true,
})

export default function OnlineCoursesWithCertificatePage() {
  const jsonLd = faqPageJsonLd(SEO_FAQ_EN, SEO_LANDING_PATH_EN)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoCursosOnlineView pageLocale="en" />
    </>
  )
}
