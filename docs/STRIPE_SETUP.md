# Stripe setup (recommended for local testing)

This project uses **Stripe Checkout** (one-time BRL payment per plan). After payment, the subscription is activated via:

1. **Redirect confirm** — `/api/billing/stripe/confirm` (works immediately on localhost)
2. **Webhook** — `/api/billing/webhook` (recommended for production)

## 1. Create a Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enable **Test mode** (toggle in the dashboard)

## 2. API keys (fix “Invalid API Key provided”)

If you see `Invalid API Key provided: sk_test_****_key`, you still have the **placeholder** from `.env.example`, not a real key.

1. Open [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys)
2. Turn **Test mode** ON (toggle top-right)
3. Under **Standard keys**, click **Reveal** on **Secret key**
4. Copy the full value — it looks like `sk_test_51AbCdE...` (about 100+ characters, **not** `sk_test_your_key`)

Create or edit `.env` in the project root (copy from `.env.example` if needed):

```env
STRIPE_SECRET_KEY=sk_test_51PASTE_THE_FULL_KEY_HERE_NO_QUOTES_NEEDED
NEXT_PUBLIC_STRIPE_ENABLED=true
NEXT_PUBLIC_MERCADOPAGO_ENABLED=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

**Important:**

| Do | Don’t |
|----|--------|
| Use **Secret key** (`sk_test_…`) | Use Publishable key (`pk_test_…`) |
| Use **Test mode** keys | Mix live (`sk_live_`) keys in dev |
| Restart dev server after editing `.env` | Leave `sk_test_your_key` from the example |

```bash
# Stop npm run dev (Ctrl+C), then:
npm run dev
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

## PIX (optional)

Checkout defaults to **card only** (`STRIPE_CHECKOUT_PAYMENT_METHODS=card`). If Stripe returns *“payment method type pix is invalid”*, PIX is not enabled on your account yet.

1. [Dashboard → Payment methods](https://dashboard.stripe.com/settings/payment_methods) — enable **Pix**
2. In `.env`: `STRIPE_CHECKOUT_PAYMENT_METHODS=card,pix`
3. Restart `npm run dev`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Stripe não configurado` | Set `STRIPE_SECRET_KEY` in `.env` and restart `npm run dev` |
| `payment method type provided: pix is invalid` | Use `STRIPE_CHECKOUT_PAYMENT_METHODS=card` or enable Pix in Stripe Dashboard |
| `ID do usuário ausente na sessão` | Sign out and sign in again (session must include user id) |
| Subscription not active after pay | Check browser Network tab for `/api/billing/stripe/confirm` |
| Email not sent | `RESEND_API_KEY` is optional; payment still activates |

## Test coupons (after seed)

- `PROMO20` — 20% off
- `BEMVINDO10` — R$ 10 off
