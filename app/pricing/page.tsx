import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import PricingPlans from '../../components/PricingPlans'

export default function PricingPage() {
  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-8">
          <h1 className={siteTitleClass}>Subscription plans</h1>
          <p className={`${siteMutedClass} mt-2 max-w-2xl`}>
            Choose a plan for unlimited access to enrolled courses, quizzes, and certificates while your subscription is
            active. Payments are processed securely with Stripe when configured.
          </p>
        </div>

        <div className={`${siteCardClass} p-6 sm:p-8`}>
          <PricingPlans />
          <p className={`${siteMutedClass} mt-6 text-xs`}>
            Set <code className="rounded bg-slate-100 px-1">STRIPE_SECRET_KEY</code>,{' '}
            <code className="rounded bg-slate-100 px-1">STRIPE_WEBHOOK_SECRET</code>, and point your Stripe webhook to{' '}
            <code className="rounded bg-slate-100 px-1">/api/billing/webhook</code>. Without Stripe keys, checkout shows
            an error until configured.
          </p>
        </div>
      </PageShell>
    </>
  )
}
