# Online Course Platform (LMS)

Professional subscription-based LMS for PDF courses, certifications, quizzes, affiliates, and marketing — built with **Next.js 14**, **PostgreSQL**, **Prisma**, **NextAuth**, and **Tailwind CSS**.

## Features

- **147 courses** across **7 categories** and **30+ subcategories** (seed catalog)
- Student registration with lead capture (WhatsApp, address, referral `?ref=`)
- **4 subscription plans** (1 / 3 / 6 / 12 months) with monthly BRL pricing display
- Stripe + Mercado Pago checkout
- In-browser **PDF viewer** with protected delivery (`/api/courses/[id]/pdf`)
- **Quizzes**: 10 questions, pass 7/10, max 3 attempts
- **Certificates** (CONECT CURSOS) with legal notice, QR verification, PDF download, and **R$ 19.99** issuance fee via Stripe
- **Affiliate** referrals and commission tracking (admin approval)
- **Admin panel**: categories, courses, marketing campaigns, analytics, commissions
- SEO: SSR, dynamic metadata, sitemap, robots.txt, JSON-LD
- i18n (PT / EN)

## Quick start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database

### 2. Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required for local dev:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000`

Optional but recommended:

- `RESEND_API_KEY` — email verification & password reset
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — payments
- `MERCADOPAGO_ACCESS_TOKEN` — PIX/card (set `NEXT_PUBLIC_MERCADOPAGO_ENABLED=true`)
- AWS S3 — PDF/thumbnail uploads in admin

### 3. Database & seed

```bash
npm install
npx prisma db push
npm run seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts (after seed)

| Role        | Email                         | Password      |
|-------------|-------------------------------|---------------|
| Admin       | admin@courseplatform.test     | password123   |
| Super Admin | superadmin@courseplatform.test| password123   |
| Student     | student@courseplatform.test   | password123   |

Student account includes a **12-month active subscription** for testing enrollments and PDF access.

## Key routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/courses` | Course catalog |
| `/categories` | Browse by category |
| `/pricing` | Subscription plans |
| `/auth/signup` | Registration (`?ref=CODE` for affiliates) |
| `/dashboard` | Student dashboard |
| `/affiliate` | Affiliate dashboard |
| `/admin` | Admin CRUD & analytics |
| `/verify/certificate/[id]` | Public certificate verification |

## Payments (Stripe — recommended)

See **[docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** for API keys and test card `4242 4242 4242 4242`.

After checkout, the dashboard calls `/api/billing/stripe/confirm` so subscriptions activate on localhost without webhooks.

Optional webhook forwarding:

```bash
npm run stripe:listen
```

## End-to-end testing

Full walkthrough (enroll → quiz → certificate): **[docs/E2E_TESTING.md](docs/E2E_TESTING.md)**

## Webhooks

- Stripe: `POST /api/billing/webhook`
- Mercado Pago: `POST /api/billing/mercadopago/webhook`

Point provider webhooks to your deployed URL and use the secrets in `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run seed` | Seed catalog, quizzes, demo users |
| `npm run db:push` | Apply Prisma schema |

## Architecture notes

- **Phase 1** (implemented): auth, courses, PDF, payments, student & admin dashboards
- **Phase 2** (implemented): affiliates, certificate verification, analytics, email campaigns
- **Phase 3** (scaffolded): video URL fields on courses/lessons; AI/community ready via schema extensions

For production: use S3/R2 + CDN for PDFs, Redis for rate limiting/caching, and BullMQ for background jobs as described in the requirements document.
