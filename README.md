# Online Course Platform (LMS)

Professional subscription-based LMS for PDF courses, certifications, quizzes, affiliates, and marketing — built with **Next.js 14**, **PostgreSQL**, **Prisma**, **NextAuth**, and **Tailwind CSS**.

## Features

- **147 courses** across **7 categories** and **30+ subcategories** (seed catalog)
- Student registration with lead capture (WhatsApp, address, referral `?ref=`)
- **4 subscription plans** (1 / 3 / 6 / 12 months) with monthly BRL pricing display
- Mercado Pago checkout (PIX + card)
- In-browser **PDF viewer** with protected delivery (`/api/courses/[id]/pdf`)
- **Quizzes**: 10 questions, pass 7/10, max 3 attempts
- **Certificates** (CONECT CURSOS) with legal notice, QR verification, PDF download, and **R$ 9.00** issuance fee via Mercado Pago
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
- `MERCADOPAGO_ACCESS_TOKEN` — payments (PIX + card; `NEXT_PUBLIC_MERCADOPAGO_ENABLED=true`)
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

## Payments (Mercado Pago — default)

Set `MERCADOPAGO_ACCESS_TOKEN` and `NEXT_PUBLIC_MERCADOPAGO_ENABLED="true"` in `.env`. Checkout uses Mercado Pago (PIX + card) for plans and certificate fees.

Configure the webhook in [Mercado Pago Developers](https://www.mercadopago.com.br/developers): `POST /api/billing/mercadopago/webhook` on your public URL (e.g. production domain).

## End-to-end testing

Full walkthrough (enroll → quiz → certificate): **[docs/E2E_TESTING.md](docs/E2E_TESTING.md)**

## Webhooks

- Mercado Pago: `POST /api/billing/mercadopago/webhook`

Point the webhook to your deployed URL in the Mercado Pago developer panel.

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
