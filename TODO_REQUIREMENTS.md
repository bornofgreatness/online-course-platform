# Online Course Platform — Requirements checklist

> Implementation status against the requirements document. Last updated: complete for Phase 1–2 MVP.

## 0. Project foundations
- [x] Next.js + Tailwind + TypeScript
- [x] Prisma + PostgreSQL
- [x] NextAuth credentials

## 1. Authentication
- [x] Registration (name, email, WhatsApp, address, city, state)
- [x] Login / logout
- [x] Password recovery (email)
- [x] Email verification
- [x] Role-based access (STUDENT, AFFILIATE, ADMIN, SUPER_ADMIN)

## 2. Student area
- [x] Dashboard: subscription, enrollments, progress, certificates, payments
- [x] Continue learning + recently viewed
- [x] Subscription expiration + access blocking

## 3. Course management
- [x] Admin CRUD courses & categories
- [x] PDF URL, thumbnails, syllabus, workload hours, SEO fields
- [x] S3 upload (admin)

## 4. PDF system
- [x] In-browser viewer
- [x] Protected delivery via `/api/courses/[id]/pdf`
- [x] Progress tracking

## 5. Quiz & certificates
- [x] 10 MC questions, pass 7/10, max 3 attempts
- [x] Automatic grading + attempt history
- [x] Certificate generation, PDF, QR, public verify page

## 6. Subscriptions & payments
- [x] Plans 1m / 3m / 6m / 1y with monthly BRL display
- [x] Stripe + Mercado Pago
- [x] Expiration + access blocking
- [x] Payment confirmation email (Resend)
- [x] Invoice / payment history

## 7. Affiliates
- [x] Registration, referral links, tracking
- [x] Commission on subscription (10%)
- [x] Admin commission approval

## 8. Admin panel
- [x] Analytics (users, revenue, subscriptions, completion, affiliates)
- [x] CRUD categories & courses
- [x] Marketing campaigns / lead export
- [x] Affiliate commissions tab

## 9. Catalog
- [x] 7 categories, 30+ subcategories, 147 courses (seed)
- [x] 100-hour workload per course

## 10. SEO
- [x] SSR, dynamic metadata, Open Graph
- [x] JSON-LD (Organization, WebSite, Course)
- [x] Sitemap + robots.txt

## 11–14. Performance, responsive, security
- [x] Mobile-first UI, responsive dashboards & PDF viewer
- [x] Rate limiting (registration), Prisma (SQL injection safe)
- [x] RBAC middleware

## 15. Future (Phase 3 — scaffolding only)
- [x] `videoUrl` on courses/lessons
- [ ] AI chatbot, live classes, community, mobile apps, gamification

## Optional / production hardening
- [ ] PayPal integration
- [ ] Redis + BullMQ
- [ ] S3 presigned URLs (currently redirect-after-auth)
- [ ] PDF watermarking
- [ ] Block sign-in until email verified
