# End-to-end test: Pay → Enroll → Quiz → Certificate

Two paths: **A** uses the seeded student (skip payment). **B** uses Stripe (full flow).

---

## Prerequisites

```bash
cp .env.example .env
# Set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3000
# For Path B also set STRIPE_SECRET_KEY (see docs/STRIPE_SETUP.md)

npm install
npx prisma db push
npm run seed
npm run dev
```

Open **http://localhost:3000**

---

## Path A — Quick flow (seeded student, no payment)

Use this to validate enroll → quiz → certificate without Stripe.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Go to `/auth/signin` | Login form |
| 2 | Email `student@courseplatform.test` / password `password123` | Redirect to dashboard |
| 3 | Dashboard → **Subscription** card | Plan `1y`, future end date |
| 4 | **Browse courses** → pick any course | Course detail page |
| 5 | Click **Enroll** (sidebar) | Enrolled; PDF viewer appears |
| 6 | Scroll PDF or click **Mark complete** | If quiz exists, you must pass quiz first |
| 7 | **Quiz** section: answer 7+ of 10 correctly | “Passed” / quiz-passed event |
| 8 | **Mark complete** in sidebar | Progress = Completed |
| 9 | **Generate certificate** | Certificate created |
| 10 | Open link **Verify publicly** or `/certificates` | Certificate number + PDF download |
| 11 | Visit `/verify/certificate/[number]` (logged out OK) | Valid certificate |

**Quiz tips:** Each course has 10 questions; passing score is **7/10**; max **3 attempts**. Default answers are in `lib/quiz.ts` (e.g. first option for seeded quizzes).

---

## Path B — Full flow with Stripe

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/auth/signup` — create a new account | Success (verify email optional if `REQUIRE_EMAIL_VERIFICATION=false`) |
| 2 | `/pricing` — select **Stripe**, plan **1 month** | Checkout redirect |
| 3 | Pay with test card `4242 4242 4242 4242` | Redirect to dashboard |
| 4 | Green banner: payment confirmed | Active subscription on dashboard |
| 5 | Continue from Path A step 4 | Same enroll → quiz → certificate flow |

If verification is required (`REQUIRE_EMAIL_VERIFICATION=true`), set in `.env`:

```env
REQUIRE_EMAIL_VERIFICATION="false"
```

for local testing, or complete email verification via the link sent (requires `RESEND_API_KEY`).

---

## API checklist (optional)

With an active session cookie, you can verify APIs:

```text
POST /api/enroll          { "courseId": "<id>" }
GET  /api/courses/<id>/quiz
POST /api/courses/<id>/quiz   { "answers": [0,0,0,0,0,0,0,0,0,0] }
POST /api/progress        { "courseId": "<id>", "progress": { "completed": true, "lastPage": 9 } }
POST /api/certificates    { "courseId": "<id>" }
GET  /api/certificates
```

---

## Mercado Pago (alternative)

For Brazil PIX/card via Mercado Pago:

1. Set `MERCADOPAGO_ACCESS_TOKEN` and `NEXT_PUBLIC_MERCADOPAGO_ENABLED=true`
2. Use [Mercado Pago test users](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/test/accounts)
3. Webhooks require a public URL (e.g. [ngrok](https://ngrok.com/) → `/api/billing/mercadopago/webhook`)

Stripe is simpler for localhost because redirect confirm activates the subscription without ngrok.

---

## Common blockers

| Symptom | Cause | Fix |
|---------|--------|-----|
| Enroll returns 403 | No active subscription | Complete Path B payment or use seeded student |
| PDF not shown | Not enrolled or subscription expired | Enroll + active plan |
| Cannot mark complete | Quiz not passed | Score ≥ 7 on quiz |
| Cannot get certificate | Course not marked complete | Mark complete after quiz |
| Checkout error | Missing Stripe key | `docs/STRIPE_SETUP.md` |
