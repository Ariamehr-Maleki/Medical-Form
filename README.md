# PulseVault

For the complete hosted Supabase, email, GitHub, and Vercel checklist, see DEPLOYMENT.md.

PulseVault is a polished interview demonstration of secure, validated medical-data intake. Verified users submit one fictional admission record, the same strict schema validates it in the browser and on the server, and the exact RFC 4180-compatible CSV plus a SHA-256 checksum is saved through the authenticated Supabase session. PostgreSQL Row Level Security keeps history, preview, and downloads owner-only.

> **Demonstration only:** PulseVault is not a clinical system and must not be used for clinical decisions or real patient information. A real healthcare deployment requires formal privacy, security, compliance, retention, audit, incident-response, and vendor reviews. This project does **not** claim HIPAA compliance.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4
- Supabase SSR Auth and PostgreSQL with RLS
- Zod 4, React Hook Form, Papa Parse, Lucide
- Vitest unit and service-boundary integration tests

## Local setup

Prerequisites: Node.js 20.9+ and a Supabase project.

1. Install dependencies:

   ```bash
   npm install
   ```

2. In Supabase, open **SQL Editor**, paste `supabase/migrations/202608020001_create_medical_submissions.sql`, and run it. With the Supabase CLI you can instead link the project and run `supabase db push`.
3. Copy `.env.example` to `.env.local` and set:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   The browser receives only the normal Supabase publishable/anon key. Never add a service-role key to this app.

4. Configure authentication as described below.
5. Start the app with `npm run dev` and open `http://localhost:3000`.

## Supabase authentication configuration

In **Authentication > Providers > Email**:

- Enable email/password.
- Keep **Confirm email** enabled so new accounts cannot access protected pages until verified.
- Keep the hosted confirmation and magic-link templates at their defaults when using Supabase's built-in sender.
- PulseVault uses Supabase's standard single-use magic link for passwordless sign-in.

In **Authentication > URL Configuration**:

- Set **Site URL** to `http://localhost:3000` for local work.
- Add `http://localhost:3000/auth/callback` as an allowed redirect URL.
- For Vercel preview deployments, add only the specific preview patterns you trust; avoid broad redirect wildcards when possible.
- After deployment, change Site URL to the production HTTPS origin and add `https://YOUR_DOMAIN/auth/callback`.

The callback only accepts same-origin paths beginning with `/`; arbitrary external redirect URLs are rejected.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

The credential-free tests cover validation boundaries, every blood type, age limits, real calendar dates, exact-cent billing normalization, custom Other values, CSV escaping/round-tripping, header order, checksum stability, safe filenames, unauthenticated and invalid write rejection, server-derived ownership, and duplicate handling.

The Playwright suite checks the landing, email-link sign-in, signup, keyboard-accessible controls, and horizontal overflow in Chromium at mobile and desktop widths. It reuses a running production server or starts one automatically.

A live RLS cross-user test needs a disposable Supabase project and two verified test accounts. Apply the production migration, insert as account A, then query the ID as account B; the select must return no row and an insert carrying A's user ID must fail. Never weaken the policies for testing.

## Vercel deployment

1. Push the repository to GitHub/GitLab/Bitbucket and import it in Vercel as a Next.js project.
2. Add all three `.env.example` variables in Vercel Project Settings. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
3. Deploy. Vercel uses `npm run build`.
4. Copy the production domain into Supabase **Site URL** and add its exact `/auth/callback` URL to the redirect allowlist.
5. Redeploy if the public site URL changed after the first build.

No database credentials or service-role secret are needed by Vercel; normal writes use the authenticated session and RLS.

## Common troubleshooting

- **Confirmation returns to an error page:** the exact `/auth/callback` origin is missing from the Supabase redirect allowlist, or `NEXT_PUBLIC_SITE_URL` does not match the browser origin.
- **Email never arrives:** the built-in sender accepts only Supabase project-team addresses and is heavily rate-limited. Check the organization Team list, Auth logs, and spam folder.
- **Magic link is expired or reused:** request a new link and wait for the visible resend cooldown. Links are single-use and Supabase-controlled.
- **Database insert fails:** confirm the migration ran, RLS policies exist, and the request has a verified authenticated session. Do not add a permissive anonymous policy.
- **History is empty after an insert:** verify the insertion and query use the same signed-in user; RLS intentionally hides every other user's records.

## Architecture and security notes

- `src/lib/medical-records/schema.ts` owns the single strict Zod schema and normalization rules.
- `src/lib/medical-records/csv.ts` owns canonical header order and Papa Parse serialization.
- `src/lib/medical-records/persistence.ts` implements validation -> normalization -> CSV -> checksum -> insert as a testable boundary.
- `src/app/api/records/route.ts` derives ownership from `supabase.auth.getUser()` and never accepts browser-supplied ownership.
- `src/proxy.ts` refreshes Supabase SSR cookies and provides optimistic route redirects; every protected page and route still authorizes server-side.
- `supabase/migrations` enables and forces RLS before adding explicit owner-only policies. Anonymous privileges are revoked.
- CSV bodies, medical fields, names, email addresses, tokens, and authentication links are never written to application logs.
- Record downloads use fixed generated filenames, `text/csv; charset=utf-8`, `nosniff`, and private/no-store caching.

## Interview demo flow

1. Start on the landing page and call out the real UI preview and non-clinical disclaimer.
2. Create an account and show the mandatory "check your email" state. Open the verification link.
3. Sign out, then demonstrate the password tab and the email magic-link flow/resend cooldown.
4. Open **New medical record** and enter the bundled fictional example from `tests/fixtures/synthetic-medical-record.csv`.
5. Trigger one invalid value (for example age 121) to show field feedback, then correct it.
6. Point out the live exact CSV preview, proceed to final review, and submit.
7. Show dashboard counts, history search/pagination, owner-only details, checksum, and exact CSV download.
8. Briefly show the migration policies and the passing validation/CSV tests.

All bundled example data is fictional.
