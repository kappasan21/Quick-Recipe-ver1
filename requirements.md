# QuickChef - Requirements Document

## Project Overview

**App Name:** QuickChef

**Description:** A recipe recommendation app that suggests 5 easy-to-cook recipes based on ingredients users have at home. Users input available ingredients, and AI generates quick recipes (< 30 minutes) with step-by-step instructions.

**Target Users:** Home cooks who want to prepare meals quickly using ingredients they already have at home.

---

## Implementation decisions (agreed)

| Topic | Decision |
|-------|-----------|
| **MVP scope** | Full MVP in one release: auth, ingredients, AI recipes, cooking mode, favorites/collections/notes, shopping suggestions, meal planning. |
| **Local dev URL** | `http://localhost:4101` (Next.js dev server port **4101**). |
| **Locales** | **Japanese (`ja`) default**, **English (`en`)**. UI and AI recipe copy follow the active locale. |
| **Auth v1** | **Supabase Auth — email/password** (signup, login, logout, password reset). OAuth (Google/GitHub) remains **optional / post-MVP** unless enabled in Supabase + env. |
| **Maintainability** | Single auth path via Supabase client (`@supabase/ssr`); RLS on all user tables; API routes validate input with **Zod**. |
| **AI** | **Google Gemini** — default model **`gemini-2.0-flash`** (free tier friendly; override via `GEMINI_MODEL`). |
| **Deploy** | **GitHub → Vercel**; production env mirrors `.env.local` / `.env.example`. |
| **Secrets** | User supplies **Supabase** and **Gemini** keys locally; never commit `.env.local`. |

---

## Tech Stack

| Component      | Technology               | Cost      | Notes                                      |
| -------------- | ------------------------ | --------- | ------------------------------------------ |
| Frontend       | Next.js 16 + TypeScript  | Free      | App Router, React 19                       |
| UI Components  | shadcn/ui + Tailwind CSS | Free      | Modern, accessible components              |
| Database       | Supabase (PostgreSQL)    | Free tier | 500MB database                             |
| Authentication | Supabase Auth            | Free tier | Email/password; OAuth optional in Supabase |
| AI API         | Google Gemini            | Free tier | 60 requests/minute (typical quota)         |
| Real-time      | Supabase Realtime        | Free tier | Available; cooking mode MVP uses local UI timers + optional future sync |
| Hosting        | Vercel                   | Free tier | Serverless deployment                      |
| i18n           | next-intl                | Free      | `ja` default, `en` secondary               |

---

## Features

### MVP Features (Must Have)

#### 1. User Authentication

- Email/password signup and login
- OAuth providers (Google, GitHub) — optional / configured in Supabase
- Password reset functionality
- Session management (Supabase SSR + middleware cookie refresh)
- User profile with dietary preferences

#### 2. Ingredient Input

- Easy-to-use form to input available ingredients
- Categories: vegetables, meats, pantry items, spices, etc.
- Quantity specification (optional)
- Save common ingredients as presets
- Manual input or quick selection from common items

#### 3. AI Recipe Generation

- Generate 5 recipe recommendations based on ingredients
- Each recipe includes:
  - Recipe name
  - Total cook time (must be < 30 minutes)
  - Ingredients needed (highlight missing items vs. what user has)
  - Step-by-step cooking instructions
  - Estimated difficulty level
  - Serving size
- Dietary preference filtering:
  - Vegetarian
  - Vegan
  - Gluten-free
  - Dairy-free
  - Nut allergies
  - Custom restrictions

#### 4. Interactive Cooking Mode

- Step-by-step instruction display
- Built-in timer for each step (client-side)
- Progress tracking in the session (real-time sync optional later)
- Voice commands — future

#### 5. Favorites System

- Save favorite recipes (persisted)
- Organize into collections
- Quick access from dashboard
- Add personal notes to saved recipes

#### 6. Shopping Suggestions

- Highlight missing ingredients for selected recipe
- Generate shopping list (from recipe or weekly plan)
- Share shopping list — optional / copy export for MVP

#### 7. Meal Planning

- Generate weekly meal plans
- Calendar view of planned meals
- Generate consolidated shopping list for the week

---

## User Stories

### Authentication

- As a user, I want to create an account so I can save my preferences and favorites
- As a user, I want to log in with email and password (OAuth when enabled)
- As a user, I want to reset my password if I forget it

### Recipe Generation

- As a user, I want to input my available ingredients and get quick recipes
- As a user, I want to filter recipes by dietary restrictions
- As a user, I want to see recipes that take less than 30 minutes
- As a user, I want to know which ingredients I'm missing for a recipe

### Cooking Experience

- As a user, I want step-by-step instructions with a timer
- As a user, I want to save my favorite recipes for later
- As a user, I want to plan my meals for the week

### Meal Planning

- As a user, I want to generate a weekly meal plan
- As a user, I want a consolidated shopping list for my meal plan

---

## Database Schema

### Profiles (`public.profiles`)

- `id` (UUID, PK, FK → `auth.users`)
- `display_name` (text, nullable)
- `dietary_restrictions` (text[])
- `favorite_cuisines` (text[])
- `skill_level` (text: beginner / intermediate / advanced)
- `updated_at` (timestamptz)

### Recipes (`public.recipes`)

- `id` (UUID, PK)
- `user_id` (UUID, FK → `auth.users`)
- `name` (text)
- `ingredients` (JSONB) — array of `{ name, amount?, category? }` with flags for missing vs have
- `instructions` (JSONB) — array of `{ text, timer_seconds? }`
- `cook_time_minutes` (int)
- `difficulty` (text)
- `servings` (int)
- `source` (text: `ai_generated` | `saved`)
- `created_at` (timestamptz)

### Collections (`public.collections`)

- `id` (UUID)
- `user_id` (UUID, FK)
- `name` (text)
- `created_at` (timestamptz)

### Favorite recipes (`public.favorite_recipes`)

- `user_id` (UUID)
- `recipe_id` (UUID, FK → `recipes`)
- `collection_id` (UUID, FK → `collections`, nullable)
- `notes` (text, nullable)
- `created_at` (timestamptz)
- Primary key (`user_id`, `recipe_id`)

### Meal plans (`public.meal_plans`)

- `id` (UUID)
- `user_id` (UUID, FK)
- `week_start_date` (date)
- `entries` (JSONB) — e.g. `{ "2026-03-31": "<recipe_id>" }` or array of day/recipe pairs
- `created_at` (timestamptz)

### Ingredient presets (`public.ingredient_presets`)

- `id` (UUID)
- `user_id` (UUID, FK)
- `name` (text)
- `ingredients` (JSONB)
- `created_at` (timestamptz)

**Note:** Favorites use a junction table instead of `is_favorite` on `recipes` for clearer collections and notes.

---

## API Endpoints (App)

### Authentication

Handled by **Supabase Auth** (client + server). App routes: `/[locale]/login`, `/[locale]/signup`, `/[locale]/forgot-password`.

### Recipe Generation

- `POST /api/recipes/generate`
  - Body: `{ ingredients: string[], dietaryRestrictions?: string[], customRestriction?: string, locale?: 'ja' | 'en' }`
  - Response: `{ recipes: Recipe[] }`

### Favorites

- `GET /api/favorites` — list saved recipes for user
- `POST /api/favorites` — body: `{ recipe, collectionId?, notes? }` (recipe payload or id)
- `DELETE /api/favorites?recipeId=` — remove favorite

### Meal Plans

- `GET /api/meal-plans`
- `POST /api/meal-plans` — create/update week
- `PUT /api/meal-plans` — same as POST for idempotent save

### Collections

- `GET /api/collections`
- `POST /api/collections` — `{ name }`
- `DELETE /api/collections?id=`

### Presets

- `GET /api/ingredient-presets`
- `POST /api/ingredient-presets`
- `DELETE /api/ingredient-presets?id=`

### Profile

- `GET /api/profile`
- `PUT /api/profile` — dietary prefs, skill, display name

---

## Non-Functional Requirements

### Performance

- Recipe generation: < 5 seconds (typical; depends on Gemini latency)
- Page load: < 2 seconds on broadband
- Mobile-first responsive design

### Security

- Secure API key storage (environment variables only)
- Row-level security (RLS) on Supabase tables
- Input validation (Zod) on API routes
- Rate limiting on sensitive routes (recommended on Vercel / edge)

### Scalability

- Serverless architecture (Vercel)
- Database connection via Supabase pooler when needed
- Edge caching for static assets

---

## Future Enhancements (Post-MVP)

- Voice commands for hands-free cooking
- Recipe sharing with friends
- Nutritional information calculation
- Integration with grocery delivery services
- Recipe ratings and reviews
- Community recipe contributions
- Image recognition for ingredient input
- OAuth as primary login (Google/GitHub) once configured

---

## Tracking

- **Setup (keys, port 4101, SQL):** see [`setup_requirements.md`](setup_requirements.md)
- **Tasks:** see [`TASKS.md`](TASKS.md)
- **Manual test checklist:** see [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md)
