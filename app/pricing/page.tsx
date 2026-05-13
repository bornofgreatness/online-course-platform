import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'

export default function PricingPage() {
  return (
    <>
      <Header />
      <PageShell>
        <div className={`${siteCardClass} mx-auto max-w-3xl p-6 sm:p-8`}>
          <h1 className={siteTitleClass}>Prices</h1>
          <p className={`${siteMutedClass} mt-2`}>Pricing details will be published here.</p>
        </div>
      </PageShell>
    </>
  )
}
