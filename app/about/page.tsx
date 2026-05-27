import Header from '../../components/Header'
import WhatsAppFloat from '../../components/WhatsAppButton'
import AboutView from '../../components/views/AboutView'

export const metadata = {
  title: 'Sobre a CONECT',
  description:
    'CONECT CURSOS — microempresa e escola de cursos presenciais e a distância em Jacobina e Serrolândia, Bahia.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <WhatsAppFloat />
      <AboutView />
    </>
  )
}
