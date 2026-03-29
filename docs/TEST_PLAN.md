# QuickChef — Test plan & status

Run manual checks after `.env.local` is filled and Supabase SQL (`supabase/migrations/001_quickchef_init.sql`) is applied.

**Legend:** `not_run` | `pass` | `fail` | `skipped`

## 1. Environment & build

| # | Case | Expected | Status |
|---|------|----------|--------|
| 1.1 | `npm install` | Completes without errors | pass |
| 1.2 | `npm run build` | Succeeds | pass |
| 1.3 | `npm run dev` (port **4101**) | App loads at `http://localhost:4101` | not_run |
| 1.4 | `npm test` | Vitest tests pass | pass |

## 2. Internationalization

| # | Case | Expected | Status |
|---|------|----------|--------|
| 2.1 | Open `/` | Japanese (default) UI | not_run |
| 2.2 | Switch to English | UI strings in English (`/en` or language menu) | not_run |
| 2.3 | Recipe generation | Output language matches selected locale | not_run |

## 3. Authentication (Supabase email/password)

| # | Case | Expected | Status |
|---|------|----------|--------|
| 3.1 | Sign up with email | User created; confirmation email if required by project | not_run |
| 3.2 | Log in / log out | Session works; header updates | not_run |
| 3.3 | Password reset request | Email received (configure SMTP in Supabase if needed) | not_run |

## 4. Ingredients & presets

| # | Case | Expected | Status |
|---|------|----------|--------|
| 4.1 | Add ingredients and generate | Recipes return (needs `GEMINI_API_KEY`) | not_run |
| 4.2 | Save preset | Preset listed; load fills ingredient field | not_run |
| 4.3 | Delete preset | Removed | not_run |

## 5. Recipe generation (Gemini)

| # | Case | Expected | Status |
|---|------|----------|--------|
| 5.1 | Generate with valid ingredients | Up to 5 recipes, cook time ≤ 29 min in schema | not_run |
| 5.2 | Dietary filters | Request includes selected diets | not_run |
| 5.3 | Invalid / empty input | 400 validation error | not_run |

## 6. Favorites & collections

| # | Case | Expected | Status |
|---|------|----------|--------|
| 6.1 | Save favorite | Appears under Favorites tab | not_run |
| 6.2 | Create collection | Appears in collection dropdown | not_run |
| 6.3 | Remove favorite | Row removed | not_run |

## 7. Shopping list

| # | Case | Expected | Status |
|---|------|----------|--------|
| 7.1 | Missing ingredients | `have: false` items listed in card | not_run |
| 7.2 | Meal plan weekly list | Aggregates missing items from planned recipes | not_run |

## 8. Meal planning

| # | Case | Expected | Status |
|---|------|----------|--------|
| 8.1 | Save week plan | Reload keeps entries for same `week_start_date` | not_run |
| 8.2 | Consolidated shopping | Shows combined missing items | not_run |

## 9. Cooking mode

| # | Case | Expected | Status |
|---|------|----------|--------|
| 9.1 | Step navigation | Next/prev updates step | not_run |
| 9.2 | Per-step timer | Countdown runs; stop clears | not_run |

## 10. Security & RLS

| # | Case | Expected | Status |
|---|------|----------|--------|
| 10.1 | Cross-user data | Cannot read other users’ recipes via API | not_run |
| 10.2 | Service role | Not exposed in client bundle | not_run |

---

**Last updated:** 2026-03-29 — automated: `npm test` and `npm run build` **pass**. Remaining rows require local Supabase + Gemini + browser verification.
