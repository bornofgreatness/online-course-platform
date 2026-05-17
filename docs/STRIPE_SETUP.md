# Stripe setup (recommended for local testing)

This project uses **Stripe Checkout** (one-time BRL payment per plan). After payment, the subscription is activated via:

1. **Redirect confirm** — `/api/billing/stripe/confirm` (works immediately on localhost)
2. **Webhook** — `/api/billing/webhook` (recommended for production)

## 1. Create a Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enable **Test mode** (toggle in the dashboard)

## 2. API keys

Developers → API keys:

- Copy **Publishable key** (optional for this app)
- Copy **Secret key** → `sk_test_...`

Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_xxxxxxxx"
NEXT_PUBLIC_STRIPE_ENABLED="true"
NEXT_PUBLIC_MERCADOPAGO_ENABLED="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

## 3. Run the app

```bash
npm install
npx prisma db push
npm run seed
npm run dev
```

## 4. Pay with a test card

1. Register a new user at `/auth/signup` (or sign in)
2. Open `/pricing`
3. Select **Stripe** as payment method
4. Choose a plan → **Subscribe**
5. On Stripe Checkout use:

| Field | Value |
|-------|--------|
| Card | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| Name / ZIP | Any |

6. After redirect to `/dashboard`, you should see **“Payment confirmed”** and an active subscription.

## 5. Webhook (production / optional locally)

Install [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Copy the webhook signing secret (`whsec_...`) to `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxx"
```

The redirect confirm endpoint already activates subscriptions; webhooks prevent missed activations if the user closes the browser early.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Stripe não configurado` | Set `STRIPE_SECRET_KEY` in `.env` and restart `npm run dev` |
| `ID do usuário ausente na sessão` | Sign out and sign in again (session must include user id) |
| Subscription not active after pay | Check browser Network tab for `/api/billing/stripe/confirm` |
| Email not sent | `RESEND_API_KEY` is optional; payment still activates |

## Test coupons (after seed)

- `PROMO20` — 20% off
- `BEMVINDO10` — R$ 10 off
