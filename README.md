# Accountant Bano

A Next.js + TypeScript accounting LMS with Supabase Auth, PostgreSQL row-level security, private storage and a responsive student/admin interface. Designed for Vercel's Node.js runtime.

**Delivery status:** source implementation, local build and offline security tests are included. No live Supabase project, administrator, course content or Vercel deployment has been configured. This is not yet a live academy. There are no sample users, fake payments or browser-only access controls in the application.

## 1. Install and run

Use Node.js 24 LTS and pnpm 11. The lockfile pins installed versions.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Windows PowerShell: use `Copy-Item .env.example .env.local` instead of `cp` if preferred. Open http://localhost:3000. Until Supabase is configured, login explains that setup is incomplete and private routes redirect to `/setup`.

## 2. Supabase database and storage

Create a **new, dedicated Supabase project**. Apply these files in order using the SQL editor, or through the Supabase CLI's migration workflow:

1. `supabase/migrations/001_lms.sql`
2. `supabase/migrations/002_upload_limits.sql`

Do not apply the initial migration to an unrelated existing application's database: it establishes the public schema's privileges for this LMS. Back up an existing academy before schema changes.

The migrations create profiles, public course descriptions, private enrollments/modules/lessons/resources, progress, doubts/replies, notifications, community posts/comments, settings and durable write limits. They also create two **private** storage buckets:

- `premium`: course MP4/WebM video, PDF, JPEG/PNG/WebP; up to 500 MiB per object, subject to your Supabase plan's global limit.
- `premium-doubts`: PDF and JPEG/PNG/WebP only, up to 10 MiB. Students cannot use the course bucket's larger upload allowance.

Never make these buckets public and do not add browser SELECT policies to their storage objects. There are intentionally no permanent public URLs for premium media. Course thumbnails and the academy logo are public HTTPS image URLs; never use these fields for premium content.

## 3. Environment variables

Set the following locally in `.      nv.local` and in Vercel's project settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-legacy-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-academy-domain.example
ADMIN_EMAIL=your-verified-admin-email@example.com
```

`NEXT_PUBLIC_SITE_URL` must be the canonical HTTPS production origin (use `http://localhost:3000` locally). The service role is used only in server-only code for controlled invitations, file signing and account deletion. Do not prefix it with `NEXT_PUBLIC_`, commit it, paste it into a browser field, or expose `.env.local` in source archives. `ADMIN_EMAIL` is only read by the operator setup script, never accepted from a registration form.

## 4. Authentication and email

In Supabase Authentication:

- Enable email/password sign-in and **Confirm email**.
- Require passwords of at least 10 characters. Enable leaked-password protection if supported by your plan.
- Configure your own SMTP provider before sending real student invitations. Configure the sender identity and authentication rate limits in Supabase; application passwords are never stored in tables.
- Set Site URL to your production origin. Add exact redirect URLs for `http://localhost:3000/auth/callback` (development), `https://YOUR_DOMAIN/auth/callback`, and `https://YOUR_DOMAIN/auth/callback?next=/profile`.
- Use token-hash confirmation links for cross-device email confirmation, invites and recovery. Set the email template action URLs as follows, replacing `YOUR_DOMAIN` with your academy domain. Keep your normal email template surrounding the link.

```text
Confirm signup:
https://YOUR_DOMAIN/auth/callback?token_hash={{ .TokenHash }}&type=signup

Invite user:
https://YOUR_DOMAIN/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/profile

Reset password:
https://YOUR_DOMAIN/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/profile
```

The callback also supports the PKCE `code` exchange. Recovery and invite links lead to Profile, where the student sets a password. A registration creates a **student** profile only; metadata cannot grant admin privileges or enrollments.

## 5. Create the first administrator

1. Register at `/register` with the intended administrator email and confirm the email.
2. Set `ADMIN_EMAIL` in `.env.local` to that verified address.
3. From your trusted local terminal, run:

```sh
node --env-file=.env.local scripts/create-admin.mjs
```

4. Sign in at `/admin/login`. No administrator password is hard-coded. Additional admin elevation uses the same operator script; student management cannot elevate roles.

## 6. Set up the academy

1. **Settings:** enter support email/WhatsApp, public logo and brand label, private WhatsApp/Telegram links, and announcement visibility.
2. **Courses:** create a course with a public description, duration and optional public thumbnail. Keep it draft until ready.
3. **Modules:** select its course, enter a title and display order. Lower numbers appear first.
4. **Lessons:** select a module, add lesson text, upload a private MP4/WebM video and/or a resource file. Select the same owning course in the file picker. Save after the upload finishes. Set published when ready.
5. **Notes:** attach a private PDF/image to the appropriate module. Uploads are real; missing files fail with an error instead of fabricated success.
6. Publish the course. Students with valid enrollments can now read its published lessons.
7. **Students:** invite a student with name, email and mobile, select course and lifetime/custom validity. Invites send a secure email; no plaintext password table is created. For already registered users, open their profile and use Grant Course Access instead of inviting again.
8. Use the same enrollment form to revoke, extend, restore or change to lifetime access. Custom start/expiry fields explicitly use **UTC**, with expiry exclusive. Disabled accounts cannot access premium content.
9. Reply under Doubts, post announcements/community updates and send per-student notifications. Lessons, notes, course updates, announcements and instructor replies generate database notifications automatically.

No payment gateway is included: purchases/enrollment authorization are handled manually, as requested. No payment confirmation is simulated.

## 7. Security model and practical limits

- All private pages validate the Supabase user server-side. Admin actions re-check the current profile role and active status; hiding links is not authorization.
- PostgreSQL RLS independently protects premium tables and ownership. Course access requires an active profile, a published course, active enrollment, start date at or before now, and lifetime access or an unexpired custom enrollment.
- Students cannot change role/active/email, assign or edit enrollments, modify curriculum, read another student's profile/doubt, forge instructor replies, or mint signed storage downloads.
- File requests go through `/api/files/[id]`, check access on **every request**, then stream a short-lived server-only storage URL. Range requests are supported. Responses and auth state are private and not cached.
- Revocation denies subsequent page/data/file requests. Bytes already downloaded or buffered cannot be recalled, and screen capture cannot be prevented. This is access control, not DRM. For long/high-volume courses, evaluate a dedicated private adaptive-video provider and Vercel streaming/bandwidth limits before launch.
- Private uploads go directly to Supabase through a signed upload token, avoiding Vercel's request-body limit. A durable database limit allows 20 student uploads/hour or 200 admin uploads/hour, 10 doubts/hour and 30 comments/hour. Auth request limiting is provided/configured by Supabase. Unused upload tokens are short-lived provider credentials; canceled uploads can leave orphan asset records/objects. Periodically reconcile unreferenced uploads through an operator cleanup job.
- Next.js Server Actions provide origin checking for forms. The upload API also rejects cross-origin requests. Text is rendered as escaped React text; no raw HTML editor or `dangerouslySetInnerHTML` is used. File serving uses safe content types, `nosniff`, no-store and a sandbox header.
- Admin data tables are paginated visually; the current server data layer reads all accessible rows in 1,000-row batches for complete counts. For a large academy, move dashboard aggregations and all filtering/pagination into dedicated SQL queries before expanding scale.
- Account/course deletion is permanent and has confirmation prompts. Supabase object bytes are not automatically deleted by relational cascades; an operator should clean retained orphan objects according to the academy's retention needs.

## 8. Validation

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:integration
```

`pnpm test` runs access/input-validation tests and the actual migration/RLS matrix inside PGlite (a PostgreSQL WASM runtime), without a fake application database. The live Supabase suite **skips** unless `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY`, and `TEST_SUPABASE_SERVICE_ROLE_KEY` are set. Use a dedicated staging Supabase project with both migrations applied. It creates disposable verified test accounts/course content and cleans them up. It does not validate your SMTP delivery.

See `ACCEPTANCE.md` for the browser launch checklist and the validation status delivered with this project. Automated policy tests do not substitute for deployed Auth, Storage, SMTP and Vercel checks.

## 9. Deploy to Vercel

1. Commit the source and lockfile to your own Git repository, excluding `.env.local`, `node_modules`, `.next` and QA artifacts.
2. Import the repository into Vercel. Choose Next.js and Node.js 24. If this app is inside a larger repository, set its directory as the Vercel root.
3. Install command: `pnpm install --frozen-lockfile`. Build command: `pnpm build`. Output directory: framework default.
4. Add the environment variables above for the intended environment. Use a separate Supabase project for Preview deployments if students must not see staging content.
5. Deploy. Set the final canonical origin in `NEXT_PUBLIC_SITE_URL`, Supabase Site URL, redirects and email templates; redeploy after environment changes.
6. Run the staging integration suite and browser checklist before granting paying students access.

## Routes

Public: `/`, `/login`, `/register`, `/forgot-password`, `/about`, `/contact`.

Student: `/dashboard`, `/course`, `/course/[courseId]`, `/lesson/[lessonId]`, `/notes`, `/doubts`, `/community`, `/announcements`, `/profile`, `/notifications`.

Admin: `/admin/login`, `/admin/dashboard`, `/admin/students`, `/admin/students/[id]`, `/admin/courses`, `/admin/courses/[id]`, `/admin/modules`, `/admin/lessons`, `/admin/notes`, `/admin/doubts`, `/admin/community`, `/admin/announcements`, `/admin/notifications`, `/admin/settings`.

## Source layout

`app/` contains routes, server actions and styles; `components/` contains public, student and admin views and reusable form/shell controls; `lib/` contains access helpers, schemas, auth and database clients; `supabase/migrations/` owns the database policies; `scripts/` contains administrator setup; `tests/` holds local and live integration checks.

Implementation references: [Next.js authentication](https://nextjs.org/docs/app/guides/authentication), [Supabase server-side clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client), and [private storage](https://supabase.com/docs/guides/storage/serving/downloads).
