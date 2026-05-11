# Online Course Platform - Work Tracker

## Admin CRUD (Admin-first)
- [x] Added admin auth helper: `lib/auth/admin.ts`
- [x] Added Admin Categories CRUD API
  - [x] `GET /api/admin/categories`
  - [x] `POST /api/admin/categories`
  - [x] `PUT /api/admin/categories/[id]`
  - [x] `DELETE /api/admin/categories/[id]`
- [x] Added Admin Courses CRUD API
  - [x] `GET /api/admin/courses`
  - [x] `POST /api/admin/courses`
  - [x] `PUT /api/admin/courses/[id]`
  - [x] `DELETE /api/admin/courses/[id]`
- [x] Replace `app/admin/page.tsx` with Admin CRUD UI (categories + courses)
- [x] Ensure UI calls `PUT`/`DELETE` correctly for selected IDs


- [ ] Verify admin endpoints using a role with `ADMIN` (and optionally `SUPER_ADMIN`)

## Next phases (not started yet)
- Quiz & attempts
- Subscriptions/payments & access gating
- Affiliate system
- Certificates + QR validation/public verification
- Protected PDF access (signed URLs / anti-direct-download)
- SEO artifacts (sitemap, structured data, open graph)
- Performance hardening (Redis, caching, CDN)

