# QuickChef - Requirements Document

## Project Overview

**App Name:** QuickChef

**Description:** A recipe recommendation app that suggests 5 easy-to-cook recipes based on ingredients users have at home. Users input available ingredients, and AI generates quick recipes (< 30 minutes) with step-by-step instructions.

**Target Users:** Home cooks who want to prepare meals quickly using ingredients they already have at home.

---

## Tech Stack

| Component      | Technology               | Cost      | Notes                           |
| -------------- | ------------------------ | --------- | ------------------------------- |
| Frontend       | Next.js 15 + TypeScript  | Free      | App Router, React 19            |
| UI Components  | shadcn/ui + Tailwind CSS | Free      | Modern, accessible components   |
| Database       | Supabase (PostgreSQL)    | Free tier | 500MB database                  |
| Authentication | Supabase Auth            | Free tier | Email/password, OAuth providers |
| AI API         | Google Gemini            | Free tier | 60 requests/minute              |
| Real-time      | Supabase Realtime        | Free tier | For interactive cooking mode    |
| Hosting        | Vercel                   | Free tier | Serverless deployment           |

---

## Features

### MVP Features (Must Have)

#### 1. User Authentication

- Email/password signup and login
- OAuth providers (Google, GitHub) - optional
- Password reset functionality
- Session management
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
  - Ingredients needed (highlight missing items)
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
- Built-in timer for each step
- Real-time progress tracking
- Voice commands (optional future feature)

#### 5. Favorites System

- Save favorite recipes
- Organize into collections
- Quick access from dashboard
- Add personal notes to recipes

#### 6. Shopping Suggestions

- Highlight missing ingredients for selected recipe
- Generate shopping list
- Share shopping list (optional)

#### 7. Meal Planning

- Generate weekly meal plans
- Calendar view of planned meals
- Generate consolidated shopping list for the week

---

## User Stories

### Authentication

- As a user, I want to create an account so I can save my preferences and favorites
- As a user, I want to log in quickly using my Google account
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

### Users (Supabase Auth)

- id (UUID)
- email
- created_at
- preferences (JSONB)

### User Preferences

- user_id (FK)
- dietary_restrictions (array)
- favorite_cuisines (array)
- skill_level (beginner/intermediate/advanced)

### Recipes

- id (UUID)
- user_id (FK)
- name
- ingredients (JSONB)
- instructions (JSONB)
- cook_time
- difficulty
- servings
- created_at
- is_favorite (boolean)

### Meal Plans

- id (UUID)
- user_id (FK)
- week_start_date
- recipes (JSONB array of recipe IDs + days)
- created_at

### Saved Ingredients

- id (UUID)
- user_id (FK)
- ingredients (JSONB)
- created_at

---

## API Endpoints

### Authentication (Supabase)

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/reset-password`

### Recipe Generation

- `POST /api/recipes/generate`
  - Body: { ingredients: string[], dietaryRestrictions: string[] }
  - Response: { recipes: Recipe[] }

### Favorites

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

### Meal Plans

- `GET /api/meal-plans`
- `POST /api/meal-plans`
- `PUT /api/meal-plans/:id`

---

## Non-Functional Requirements

### Performance

- Recipe generation: < 5 seconds
- Page load: < 2 seconds
- Mobile-first responsive design

### Security

- Secure API key storage (environment variables)
- Row-level security in Supabase
- Input validation and sanitization
- Rate limiting on API endpoints

### Scalability

- Serverless architecture (Vercel)
- Database connection pooling
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
