# TODO

## Step 1 — Fix build/runtime blockers
- [ ] Ensure `next build` succeeds in this environment.
  - [ ] Add Suspense boundary / refactor pages using `useSearchParams` in:
    - [ ] `app/auth/verify-email/page.tsx`
    - [ ] `app/auth/reset-password/page.tsx`
  - [ ] Ensure Prisma/API routes don’t crash static export due to missing DB connection.

## Step 2 — Email verification requirement
- [ ] Verify `POST /api/auth/confirm-email` implementation end-to-end:
  - [ ] token lookup + expiry + used checks
  - [ ] mark `user.emailVerifiedAt`
  - [ ] mark token `used=true`

## Step 3 — Update checklist
- [ ] Update `TODO_REQUIREMENTS.md` checkboxes based on what now works.

## Step 4 — Continue implementing remaining missing requirements
- [ ] Affiliate flows
- [ ] Student dashboard sections
- [ ] Quizzes + certificates + verification
- [ ] Subscriptions/payment integrations
- [ ] Access control guards
- [ ] SEO/perf/security items

