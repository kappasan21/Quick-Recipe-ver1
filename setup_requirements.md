# QuickChef - Setup Requirements

## Required Accounts & API Keys

Before running the app locally or deploying, obtain the following:

---

## 1. Supabase Account (Database + Authentication)

### What you need

- [ ] **Supabase Account** (Free tier)
- [ ] **Project URL**
- [ ] **Anon Key** (public, safe for browser)
- [ ] **Service Role Key** (private, **server-only**)

### How to get them

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project (e.g. name: `quickchef`)
4. Save the **database password** securely
5. Go to **Settings → API**
6. Copy **Project URL**, **anon** key, and **service_role** key (reveal only in a secure place)

### SQL

Run the migration in `supabase/migrations/` on your project (**SQL Editor** → paste → run), or use Supabase CLI linked to the project.

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 2. Google Gemini API Key (AI Recipe Generation)

### What you need

- [ ] **Google AI Studio** / Google Cloud account with Generative Language API
- [ ] **Gemini API Key**

### How to get it

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in
3. Create an API key (or use an existing GCP project with billing/quota as applicable)

### Free tier

Typical limits include **requests per minute** and **per day** — suitable for development and small production traffic. The app defaults to a **Flash** model (`gemini-2.0-flash`) to stay efficient; override with `GEMINI_MODEL` if needed.

### Environment variables

```env
GEMINI_API_KEY=your-gemini-api-key
# Optional — default is gemini-2.0-flash
# GEMINI_MODEL=gemini-2.0-flash
```

---

## 3. Vercel + GitHub (Deployment)

### What you need

- [ ] **GitHub** repository containing this project
- [ ] **Vercel** account (Free tier)
- [ ] Vercel project **imported from GitHub**

### Steps

1. Push the repo to GitHub
2. In Vercel: **Add New Project** → import the repository
3. Framework: **Next.js** (auto-detected)
4. Add **all** environment variables from `.env.example` (same names as local)
5. Deploy

### Production URL

Set `NEXT_PUBLIC_APP_URL` to your Vercel URL, e.g. `https://your-app.vercel.app`.

---

## 4. Optional: OAuth Providers (Social Login)

Configure in **Supabase Dashboard → Authentication → Providers** when ready.

### Google OAuth (example)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. OAuth 2.0 Client ID (Web)
3. Authorized redirect URIs (Supabase shows the exact callback URL per provider)

### Local dev redirects

This project uses **port 4101** for Next.js:

- Site URL in Supabase: `http://localhost:4101`
- Additional redirect: `http://localhost:4101/**` as needed per Supabase docs
- Add **`http://localhost:4101/auth/callback`** under **Authentication → URL Configuration → Redirect URLs** so email confirmation, password reset, and OAuth can return to the app.

### When are redirect / Site URL settings required?

| Situation | Need redirect URLs & Site URL? |
|-----------|----------------------------------|
| Sign up with **email confirmation** on, or **password reset**, or **OAuth** | **Yes** — configure as above (and production URL when you deploy). |
| **Only** email + password **login**, user already exists, confirm email **off** | You can develop **without** perfect redirect config; still set **Site URL** before production. |

This app exchanges the auth **code** at **`/auth/callback`** (see `src/app/auth/callback/route.ts`), so that URL must be allowed when you use flows that send users back from email or OAuth.

### GitHub OAuth

1. GitHub → Settings → Developer settings → OAuth Apps
2. Authorization callback URL must match **Supabase** provider callback (see Supabase GitHub provider docs)

### Optional env (only if your app reads them; Supabase often stores provider secrets in dashboard)

```env
# Optional — many setups configure OAuth only in Supabase Dashboard
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

---

## Environment Variables Summary

Create **`.env.local`** in the project root (never commit it). Use **`.env.example`** as a template.

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini (required for recipe generation)
GEMINI_API_KEY=your-gemini-api-key
# GEMINI_MODEL=gemini-2.0-flash

# App URL — local and production
NEXT_PUBLIC_APP_URL=http://localhost:4101

# OAuth (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
```

---

## Local development

```bash
npm install
npm run dev
```

The dev server listens on **port 4101** (`http://localhost:4101`).

---

## Cost Summary (Free Tier)

| Service  | Free Tier Notes        |
| -------- | ---------------------- |
| Supabase | DB + Auth limits       |
| Gemini   | RPM/RPD quotas         |
| Vercel   | Bandwidth/build limits |

**Target MVP cost:** $0 on free tiers when usage stays within limits.

---

## Security Notes

1. **Never commit `.env.local`**
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the browser
3. Set production secrets only in **Vercel** (or your host) environment settings
4. Enable **RLS** on all `public` tables (see migrations)
5. Add **rate limiting** for production API routes as traffic grows

---

## Checklist Before First Run

- [ ] Supabase project created; SQL migration applied
- [ ] Supabase URL and keys in `.env.local`
- [ ] Gemini API key in `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL=http://localhost:4101` for local
- [ ] `npm install` and `npm run dev` on port 4101
- [ ] (Later) GitHub repo + Vercel deploy with env vars

---

## Docs in this repo

| File | Purpose |
|------|---------|
| [`requirements.md`](requirements.md) | Product + technical requirements |
| [`TASKS.md`](TASKS.md) | Implementation task status |
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Manual test checklist |
