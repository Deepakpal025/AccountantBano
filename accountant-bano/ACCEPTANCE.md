# Validation and launch acceptance

## Delivered validation

- TypeScript and the optimized Next.js production build passed locally.
- 20 local tests passed, including the actual database migrations and PostgreSQL RLS policies in PGlite.
- The live Supabase integration test was **skipped** because a live test project and credentials were not provided.
- Browser checks covered 13 routes at 1440px and 390px. Public pages returned successfully, no JavaScript exceptions or horizontal page overflow were detected, and private routes redirected to the setup screen with the backend unconfigured.
- Landing page desktop/mobile screenshots were visually reviewed.
- 8 Playwright browser tests passed across desktop/mobile, including actual CTA navigation, signed-out route redirects, runtime error checks and 200% text enlargement.
- Authenticated student/admin browser flows, real email delivery, private video streaming and Vercel deployment remain **unverified** until staging configuration is supplied. No live production-readiness claim is made.

## Before accepting paying students

Use a dedicated staging Supabase project and three accounts: admin, enrolled student and an unassigned student. Never use real student information as test data.

| Scenario | Expected result |
|---|---|
| Student registration and confirmation | Email is received; confirmation creates a valid session and student-only profile |
| Invalid password | Friendly error; no session |
| Admin login | Admin opens `/admin/dashboard`; student credentials cannot enter admin routes |
| Signed-out private route | Redirects to login; no premium page content returned |
| Unassigned student | Sees no lessons/files; contact-support message appears |
| Grant lifetime | Course appears; no expiry date; lessons and notes open |
| Future start date | Premium content remains unavailable until start time |
| Expired custom access | Page, API and file requests are denied |
| Extend validity | Access restores after refresh |
| Revoke access with student logged in | Subsequent pages, APIs and video range/file requests deny access |
| Disable student | All premium access denied; restoring active status restores otherwise-valid access |
| Lesson completion | Progress updates and persists after logout/login; undo works |
| Private note and video upload | File attaches to correct course; signed upload succeeds within bucket limit |
| Direct storage download/signing | Unassigned student and enrolled browser client cannot bypass application file proxy |
| Cross-course attachment | Database rejects an attachment from a different course or owner |
| Create doubt with image | Only its student and admins can read it |
| Admin reply | Student sees answer, answered status and notification |
| Community | Only enrolled students enter; disabled comments cannot be posted |
| Announcement toggle | Off hides announcements; on restores them |
| Student invitation | Secure invite email arrives; student sets password in Profile |
| Password reset | Recovery email works across devices and cannot redirect to another origin |
| Mobile authenticated flows | Lesson controls, bottom navigation, tables, forms, sign-out and uploads work at 390px |
| Failed upload/network | No fake success; retry is possible |
| Vercel production | Auth cookies, redirects, video ranges, downloads and secure environment values work on final domain |

## Repeatable commands

```sh
pnpm typecheck
pnpm test
pnpm build
```

Run live database/Auth/Storage verification only against staging:

```sh
# Set TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY,
# TEST_SUPABASE_SERVICE_ROLE_KEY in a private local environment.
pnpm test:integration
```

For public browser checks, start the app in another terminal, install a Playwright browser (`pnpm exec playwright install chromium`), then run `pnpm exec playwright test`. Optionally set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome and `TEST_APP_URL` to target staging. These public tests do not replace the authenticated checklist above.
