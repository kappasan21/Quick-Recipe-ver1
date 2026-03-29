# QuickChef — Task list

Status: `pending` | `in_progress` | `done` | `blocked`

| ID | Task | Status |
|----|------|--------|
| T1 | Project scaffold (Next.js 16, Tailwind, shadcn, port **4101**) | done |
| T2 | i18n (`ja` default, `en`) + `messages/*.json` | done |
| T3 | Supabase clients + middleware (i18n + auth cookie refresh) + `.env.example` | done |
| T4 | Database SQL + RLS (`supabase/migrations/001_quickchef_init.sql`) | done |
| T5 | Auth UI: signup, login, logout, password reset | done |
| T6 | Profile / dietary preferences (`/api/profile`) | done |
| T7 | Ingredients UI + presets (`/api/ingredient-presets`) | done |
| T8 | Gemini `POST /api/recipes/generate` + Zod validation | done |
| T9 | Recipe list/detail, missing ingredients, shopping list (dashboard) | done |
| T10 | Cooking mode (`/[locale]/cook/[recipeId]`) steps + timers | done |
| T11 | Favorites + collections + notes (`/api/favorites`, `/api/collections`) | done |
| T12 | Meal plan + weekly shopping (`/api/meal-plans`) | done |
| T13 | Vitest (`src/lib/recipe-schema.test.ts`) + `npm run build` | done |
| T14 | Docs: `requirements.md`, `SETUP_REQUIREMENTS.md`, `docs/TEST_PLAN.md` | done |

**Blocked / user action:** Run Supabase SQL on your project and add `.env.local` before manual E2E testing.

**Last updated:** 2026-03-29 — implementation pass complete; run [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) after configuring env + DB.
