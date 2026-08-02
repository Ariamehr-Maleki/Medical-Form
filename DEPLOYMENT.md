# PulseVault: Supabase, email, GitHub, and Vercel deployment

Follow this in order. Never commit `.env.local`, a database password, a Supabase access token, an API key, or a service-role key.

## 1. Create the hosted Supabase project

1. Create a new project at https://supabase.com/dashboard.
2. Save the database password in your password manager.
3. In **Project Settings > API**, copy:
   - Project URL
   - Publishable key (`sb_publishable_...`)
4. Find the project ref in the dashboard URL: `https://supabase.com/dashboard/project/PROJECT_REF`.

Fill `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The publishable key is expected in browser code. Never substitute the secret/service-role key.

## 2. Link the CLI and deploy the database

From the PulseVault repository root:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run supabase:push
npm run supabase:migrations
npm run supabase:lint
```

`supabase link` prompts for the database password. `supabase:push` applies the versioned migration, including the table, indexes, checksum/data constraints, grants, RLS, and owner-only policies.

Check the Supabase Table Editor for `public.medical_submissions`. In **Database > Policies**, confirm RLS is enabled and the three owner policies exist. Do not add an anonymous or public policy.

Optional local Docker stack:

```powershell
npm run supabase:start
# Local Studio: http://localhost:54323
npm run supabase:stop
```

## 3. Configure hosted Supabase Auth

These dashboard settings are not deployed by `db push`.

In **Authentication > Providers > Email**:

- Enable the Email provider.
- Enable email/password signup.
- Enable **Confirm email**. Do not enable automatic confirmation.
- Keep anonymous sign-ins disabled.
- Set the minimum password length to at least 8.

In **Authentication > URL Configuration**, while testing locally:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

After Vercel gives you the production domain, change/add:

- Site URL: `https://YOUR-PRODUCTION-DOMAIN`
- Redirect URL: `https://YOUR-PRODUCTION-DOMAIN/auth/callback`

For trusted Vercel preview deployments you may additionally allow `https://*-YOUR-VERCEL-TEAM.vercel.app/**`. The exact production callback is safer for the main deployment.

## 4. Use Supabase's built-in email service

No third-party email provider is required for this private demonstration. Leave **Authentication > SMTP Settings** disabled; Supabase will send the signup-confirmation and magic-link emails itself.

The built-in service has strict limitations:

- It sends only to email addresses that belong to members of your Supabase organization team.
- It is currently limited to about two messages per hour.
- It is best-effort and has no delivery SLA.
- It is suitable only for setup, toy projects, and private demonstrations.

Use the same email address as your Supabase account, or add another test address under your organization's **Team** settings before testing. An arbitrary interviewer or public user will receive an `Email address not authorized` error unless you later configure custom SMTP.

## 5. Keep the hosted default email templates

For a new Free-tier project using Supabase's built-in sender, keep the hosted confirmation and magic-link templates at their defaults. New Free projects cannot customize those hosted templates while using the default sender.

PulseVault now supports the default behavior:

- Signup sends Supabase's standard email-verification link.
- Passwordless sign-in sends Supabase's standard single-use magic link.
- Password sign-in continues to work after the address has been verified.

The files under `supabase/templates` are local-Docker references only and do not need to be copied into the hosted dashboard.

## 6. Test locally against hosted Supabase

```powershell
npm run dev
```

Verify with an email address listed in your Supabase organization team:

1. Sign up.
2. Confirm that dashboard access is blocked before verification.
3. Open the confirmation email and complete the callback.
4. Log out and sign in with password.
5. Log out, request an email sign-in link, open it, and confirm that it signs you in.
6. Submit the fictional record in `tests/fixtures/synthetic-medical-record.csv`.
7. Confirm it appears in dashboard/history and that the exact CSV downloads.
8. Create a second user and confirm it cannot read the first user's row.

## 7. Push to GitHub

The project directory is initialized as its own Git repository. Verify `.env.local` is ignored before committing:

```powershell
git status --short
git check-ignore .env.local
```

With GitHub CLI:

```powershell
git add .
git commit -m "feat: build PulseVault secure medical intake portal"
gh auth login
gh repo create pulsevault --private --source=. --remote=origin --push
```

Without GitHub CLI, create an empty repository named `pulsevault` on GitHub, then run:

```powershell
git add .
git commit -m "feat: build PulseVault secure medical intake portal"
git remote add origin https://github.com/YOUR_USERNAME/pulsevault.git
git push -u origin main
```

Do not initialize the GitHub repository with a README or `.gitignore`; this local project already has both.

## 8. Deploy with Vercel

1. Import the GitHub repository into Vercel.
2. Add these Production environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
```

3. Deploy.
4. Copy the final Vercel domain into Supabase Site URL and redirect configuration as described above.
5. Redeploy if `NEXT_PUBLIC_SITE_URL` changed.
6. Run the signup, confirmation, password login, magic-link login, submission, history, and download flow on the production URL.

Vercel does not need the database password, Supabase access token, SMTP credentials, or service-role key.

## 9. Final commands

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

The Playwright smoke test can run after a production build with:

```powershell
npx playwright install chromium
npm run test:e2e
```
