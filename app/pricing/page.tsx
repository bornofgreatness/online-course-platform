import Header from '../../components/Header'
import WhatsAppFloat from '../../components/WhatsAppButton'
import PricingView from '../../components/views/PricingView'

export const metadata = {
  title: 'Preços',
  description:
    'Planos de assinatura CONECT CURSOS — acesso ao catálogo completo, quizzes e certificados. Pagamento em reais (R$).',
}

export default function PricingPage() {
  return (
    <>
      <Header />
      <WhatsAppFloat />
      <PricingView />
    </>
  )
}
