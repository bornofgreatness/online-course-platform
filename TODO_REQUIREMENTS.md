# Online Course Platform — Requirements TODO (Complete all)

> This file is the canonical implementation checklist for the provided requirements doc.

## 0. Project foundations
- [x] Next.js + Tailwind base present
- [x] Prisma configured
- [x] NextAuth credentials login present

## 1. Authentication System
- [x] Student registration (UI + API) 
- [x] Student login (NextAuth credentials)
- [x] Password recovery via email (Resend)
  - [x] `POST /api/auth/forgot-password`
  - [x] `POST /api/auth/reset-password`
  - [x] UI pages `/auth/forgot-password` and `/auth/reset-password`
  - [x] Prisma model `PasswordResetToken`
- [x] Email verification
  - [x] Generate verification token
  - [x] Send verification email
  - [x] Verify token + mark user verified
  - [ ] Block sign-in for unverified users (optional)

- [x] Secure session management (completed via NextAuth)
- [x] JWT/auth-based auth (completed via NextAuth JWT)
- [ ] Role-based access control (Student/Affiliate/Admin/Super Admin)
  - [x] Admin gating helpers exist (ADMIN/SUPER_ADMIN)
  - [ ] Affiliate role flows + permissions
  - [ ] Super Admin role flows + permissions

## 2. Student Area
- [ ] Dashboard sections
  - [ ] Active subscription(s)
  - [ ] Enrolled courses
  - [ ] Progress tracking (per-material)
  - [ ] Certificate downloads
  - [ ] Payment history
  - [ ] Affiliate earnings (if affiliate)
- [ ] Continue learning + recently accessed courses
- [ ] Subscription expiration date + access blocking

## 3. Course Management System
- [ ] Create/edit/delete courses (admin)
- [ ] Categories CRUD (admin) (partial)
- [ ] PDF lessons upload & storage
- [ ] Course thumbnails
- [ ] Course descriptions, syllabus, workload hours
- [ ] SEO metadata fields

## 4. PDF Course System
- [ ] In-browser PDF viewing
- [ ] PDF download permissions
- [ ] Secure file access (signed URLs)
- [ ] Watermark support (optional)
- [ ] Progress tracking by viewed materials
- [ ] Anti-direct-download protection

## 5. Assessment & Certification System
Quiz
- [ ] Quiz model: exactly 10 multiple-choice questions
- [ ] Passing score 7/10
- [ ] Max attempts 3
- [ ] Automatic grading
- [ ] Result history tracking

Certificates
- [ ] Automatic certificate generation
- [ ] QR code validation
- [ ] Unique certificate ID/number
- [ ] Certificate download (PDF)
- [ ] Public verification page

## 6. Subscription & Payment System
- [ ] Plans: 1 month / 3 months / 6 months / 1 year
- [ ] Recurring payments
- [ ] Automatic expiration
- [ ] Access blocking after expiration
- [ ] Payment confirmation emails
- [ ] Invoice history
- [ ] Stripe integration
- [ ] PayPal integration
- [ ] Mercado Pago integration (optional)

## 7. Access Control System
- [ ] Subscription validation middleware/guards
- [ ] Course locking
- [ ] Route protection (student/affiliate/admin/super-admin)

## 8. Affiliate System
- [ ] Affiliate registration
- [ ] Unique referral links
- [ ] Referral tracking
- [ ] Commission generation logic
- [ ] Affiliate earnings dashboard
- [ ] Admin approval option for commissions

## 9. Administrative Panel
- [ ] Dashboard analytics
  - [ ] Total users
  - [ ] Revenue
  - [ ] Active subscriptions
  - [ ] Course completion rates
  - [ ] Affiliate performance
- [ ] Admin CRUD:
  - [ ] Courses
  - [ ] Categories
  - [ ] Quiz content
  - [ ] Certificates
  - [ ] Payments
  - [ ] Subscriptions
  - [ ] Students
  - [ ] Affiliates & commissions

## 10. SEO Optimization
- [ ] SSR + SEO-friendly URLs
- [ ] Dynamic metadata + OpenGraph
- [ ] Structured data (JSON-LD)
- [ ] Sitemap generation
- [ ] robots.txt

## 11. Performance Requirements
- [ ] CDN delivery for PDFs
- [ ] Lazy loading, optimized images
- [ ] DB indexing
- [ ] API caching
- [ ] Redis integration (optional)
- [ ] Edge delivery support

## 12. Responsive Design
- [ ] Mobile-first UI
- [ ] Responsive dashboards
- [ ] Responsive PDF viewer

## 13. Security Requirements
- [ ] Rate limiting
- [ ] CSRF protection (where applicable)
- [ ] XSS protection
- [ ] SQL injection protection (Prisma)
- [ ] Secure payment handling
- [ ] GDPR-ready structure

## 14. Future Expansion Preparation
- [ ] Video courses scaffolding
- [ ] AI chatbot integration scaffolding
- [ ] AI-generated quizzes scaffolding
- [ ] Live classes scaffolding
- [ ] Community/forum scaffolding
- [ ] Mobile app APIs scaffolding
- [ ] Multi-language support scaffolding

## 15. Suggested DB structure
- [ ] Ensure tables/relations exist for:
  - [ ] enrollments
  - [ ] subscriptions
  - [ ] payments
  - [ ] certificates
  - [ ] quizzes
  - [ ] quiz_questions
  - [ ] quiz_attempts
  - [ ] affiliates
  - [ ] affiliate_commissions
  - [ ] referrals


