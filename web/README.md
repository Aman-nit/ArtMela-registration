# Art Mela Registration

Secure Pahchan Foundation event registration app built with Next.js and Supabase.

## Structure

- `src/app`: pages, server actions, and the admin XLSX export route.
- `src/lib/supabase`: server-side Supabase clients and session middleware.
- `supabase/migrations`: database schema and policy changes, applied in order.

The `web/` Next.js app is the only supported application. Legacy static prototypes and photo demos have been removed.

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Apply the migrations in `../supabase/migrations` in order. Migration `0003_remove_photos_add_registration_fields.sql` removes photo registration and adds address, guardian name, and volunteer name.

Create Supabase Auth users without public signup. Use the internal email convention `{username}@auth.pahchanfoundation.org`, then add matching rows to `public.profiles` with either `ADMIN` or `VOLUNTEER` role.

When testing from another device on the same LAN, add its host/IP to `ALLOWED_DEV_ORIGINS` in `.env.local` as a comma-separated list, then restart `npm run dev`. This setting is only used by the development server and is ignored in production.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

Deploy the `web/` directory to Vercel or another Next.js host. If importing the repository in Vercel, set **Root Directory** to `web`.

Configure these environment variables in Vercel for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do not commit `.env.local` or expose Supabase service-role credentials.

For production, do not configure `ALLOWED_DEV_ORIGINS`. Vercel does not need it because it serves the application over its production domain.

## CI/CD

The GitHub Actions workflows in `../.github/workflows/` run linting, typechecking, and a production build for pull requests and pushes to `main`.

The deployment workflow can deploy a prebuilt artifact to Vercel after a push to `main` or from **Actions → Deploy to Vercel → Run workflow**. Add these GitHub repository secrets before enabling it:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

The Vercel project should still contain the two Supabase environment variables above. The free Vercel Hobby plan and Supabase Free plan have usage limits, so check current plan terms before using this for a high-volume public event.
