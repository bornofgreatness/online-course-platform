# Admin CRUD - Progress Tracker

## Backend
- [x] Admin auth helper (`lib/auth/admin.ts`): role must be `ADMIN` or `SUPER_ADMIN`
- [x] Admin categories CRUD API
  - [x] GET `/api/admin/categories`
  - [x] POST `/api/admin/categories`
  - [x] PUT `/api/admin/categories/[id]`
  - [x] DELETE `/api/admin/categories/[id]`
- [x] Admin courses CRUD API
  - [x] GET `/api/admin/courses`
  - [x] POST `/api/admin/courses`
  - [x] PUT `/api/admin/courses/[id]`
  - [x] DELETE `/api/admin/courses/[id]`

## Frontend (Next)
- [ ] Replace `app/admin/page.tsx` analytics-only dashboard with Admin CRUD UI:
  - [ ] Categories: list + create + edit + delete
  - [ ] Courses: list + create + edit + delete (fields: pdfUrl/thumbnail/syllabus/SEO/workloadHours/categoryId)
- [ ] Ensure admin UI is protected by role `ADMIN`/`SUPER_ADMIN`

## Verification
- [ ] Run build/typecheck (blocked by Windows PowerShell policy in this environment)

