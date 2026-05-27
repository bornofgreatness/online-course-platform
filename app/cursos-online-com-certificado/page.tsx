import SeoCursosOnlineView from '../../components/views/SeoCursosOnlineView'
import { SEO_FAQ_PT } from '../../lib/seo/faqContent'
import { faqPageJsonLd } from '../../lib/seo/faqJsonLd'
import { buildPageMetadata } from '../../lib/seo/metadata'
import { SEO_LANDING_PATH_PT } from '../../lib/seo/paths'

export const metadata = buildPageMetadata({
  title: 'Cursos online com certificado rápido e barato',
  description:
    'Plataforma de cursos online com certificado digital imediato. Cursos rápidos de TI, administração, saúde, marketing e mais. Certificado válido no Brasil, horas complementares, 20 a 100 horas.',
  path: SEO_LANDING_PATH_PT,
  locale: 'pt',
  seoAlternates: true,
})

export default function CursosOnlineComCertificadoPage() {
  const jsonLd = faqPageJsonLd(SEO_FAQ_PT, SEO_LANDING_PATH_PT)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoCursosOnlineView pageLocale="pt" />
    </>
  )
}
