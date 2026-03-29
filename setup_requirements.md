# QuickChef - Setup Requirements

## Required Accounts & API Keys

Before starting development, you need to obtain the following:

---

## 1. Supabase Account (Database + Authentication)

### What you need:
- [ ] **Supabase Account** (Free tier)
- [ ] **Project URL**
- [ ] **Anon Key** (Public API key)
- [ ] **Service Role Key** (Private, server-side only)

### How to get them:

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project:
   - Click "New Project"
   - Name: `quickchef`
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to provision (~2 minutes)
5. Go to Settings → API
6. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
   - **service_role key** (click "Reveal" - keep this secret!)

### Environment variables needed:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 2. Google Gemini API Key (AI Recipe Generation)

### What you need:
- [ ] **Google AI Studio Account** (Free tier)
- [ ] **Gemini API Key**

### How to get it:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Click "Create API Key"
5. Choose "Create API key in new project" (or existing project)
6. Copy the API key

### Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and small production apps

### Environment variable needed:
```env
GEMINI_API_KEY=your-gemini-api-key
```

---

## 3. Vercel Account (Deployment)

### What you need:
- [ ] **Vercel Account** (Free tier)
- [ ] **Vercel Project**

### How to set it up:

1. Go to [vercel.com](https://vercel.com)
2. Sign up (recommend using GitHub for easy integration)
3. After development, you'll connect your GitHub repository

### For deployment:
- Vercel will automatically detect Next.js
- Set environment variables in Vercel dashboard
- Deploy with one click

---

## 4. Optional: OAuth Providers (Social Login)

### Google OAuth (for social login):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to "APIs & Services" → "Credentials"
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`
6. Copy Client ID and Client Secret

### GitHub OAuth (for social login):
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. Configure in Supabase: Authentication → Providers → GitHub

### Environment variables (if using OAuth):
```env
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Environment Variables Summary

Create a `.env.local` file in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI (Required)
GEMINI_API_KEY=your-gemini-api-key

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# App URL (Required for production)
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

---

## Cost Summary (Free Tier)

| Service | Free Tier Limits | Notes |
|---------|------------------|-------|
| Supabase | 500MB DB, 1GB storage, 50k monthly active users | Generous for MVP |
| Gemini | 60 req/min, 1,500 req/day | Sufficient for development |
| Vercel | 100GB bandwidth, 6,000 build minutes | Perfect for Next.js |

**Estimated monthly cost for MVP: $0**

---

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env.local` to git** - It's already in `.gitignore`
2. **Never expose Service Role Key** on the client side
3. **Use environment variables** in Vercel dashboard for production
4. **Enable Row Level Security (RLS)** in Supabase tables
5. **Set up rate limiting** for API endpoints in production

---

## Checklist Before Development

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase URL and keys copied
- [ ] Google AI Studio account created
- [ ] Gemini API key obtained
- [ ] (Optional) Google OAuth configured
- [ ] (Optional) GitHub OAuth configured
- [ ] `.env.local` file created with all variables
- [ ] Vercel account created (for later deployment)

---

**Let me know when you have gathered all the required API keys and I'll help you set up the project!**