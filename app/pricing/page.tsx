import Header from '../../components/Header'
import WhatsAppFloat from '../../components/WhatsAppButton'
import PricingView from '../../components/views/PricingView'
import { buildPageMetadata } from '../../lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Planos e preços | Affordable online courses',
  description:
    'Planos de assinatura em R$ / Affordable BRL subscription plans. Full catalog access and low-cost digital certificate after completion. CONECT CURSOS.',
  path: '/pricing',
})

export default function PricingPage() {
  return (
    <>
      <Header />
      <WhatsAppFloat />
      <PricingView />
    </>
  )
}
