'use client'

import { useI18n } from '../../components/LanguageProvider'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import PricingPlans from '../../components/PricingPlans'

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-8">
          <h1 className={siteTitleClass}>{t('common.prices')}</h1>
          <p className={`${siteMutedClass} mt-2 max-w-2xl`}>{t('pricing.intro')}</p>
        </div>

        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <PricingPlans />
          <p className={`${siteMutedClass} mt-6 text-xs`}>{t('pricing.stripeNote')}</p>
        </div>
      </PageShell>
    </>
  )
}
