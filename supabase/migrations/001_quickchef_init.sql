-- QuickChef initial schema (run in Supabase SQL Editor or via CLI)

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  dietary_restrictions text[] not null default '{}',
  favorite_cuisines text[] not null default '{}',
  skill_level text not null default 'beginner'
    check (skill_level in ('beginner', 'intermediate', 'advanced')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Saved / generated recipes
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  cook_time_minutes int not null,
  difficulty text not null,
  servings int not null default 2,
  source text not null default 'saved'
    check (source in ('ai_generated', 'saved')),
  created_at timestamptz not null default now()
);

create index recipes_user_id_idx on public.recipes (user_id);

alter table public.recipes enable row level security;

create policy "recipes_all_own"
  on public.recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Collections for favorites
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index collections_user_id_idx on public.collections (user_id);

alter table public.collections enable row level security;

create policy "collections_all_own"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Favorites junction
create table public.favorite_recipes (
  user_id uuid not null references auth.users on delete cascade,
  recipe_id uuid not null references public.recipes on delete cascade,
  collection_id uuid references public.collections on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.favorite_recipes enable row level security;

create policy "favorite_recipes_all_own"
  on public.favorite_recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Weekly meal plans
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  week_start_date date not null,
  entries jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

alter table public.meal_plans enable row level security;

create policy "meal_plans_all_own"
  on public.meal_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ingredient presets
create table public.ingredient_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  ingredients jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index ingredient_presets_user_id_idx on public.ingredient_presets (user_id);

alter table public.ingredient_presets enable row level security;

create policy "ingredient_presets_all_own"
  on public.ingredient_presets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
