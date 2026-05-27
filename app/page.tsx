import LandingPage from '../components/LandingPage'
import { buildPageMetadata } from '../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Cursos online com certificado rápido | Online courses with certificate',
  description:
    'CONECT CURSOS — plataforma de cursos online baratos com certificado digital / affordable online courses with fast digital certificates. EaD, 100 hours, Brazil.',
  path: '/',
  seoAlternates: true,
})

export default function Home() {
  return <LandingPage />
}
