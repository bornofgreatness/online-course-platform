import Header from '../../components/Header'
import WhatsAppFloat from '../../components/WhatsAppButton'
import AboutView from '../../components/views/AboutView'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Sobre a CONECT — escola de cursos EaD',
  description:
    'CONECT CURSOS: microempresa e escola de cursos presenciais e a distância em Jacobina e Serrolândia, Bahia. Parceria CIBT e ADEB.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <>
      <Header />
      <WhatsAppFloat />
      <AboutView />
    </>
  )
}
