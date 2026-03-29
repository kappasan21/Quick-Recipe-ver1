import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";
import { recipeSchema } from "@/lib/recipe-schema";

const postSchema = z.object({
  recipe: recipeSchema,
  collectionId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data: favs, error: favErr } = await auth.supabase
    .from("favorite_recipes")
    .select("recipe_id, notes, collection_id, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (favErr) {
    console.error(favErr);
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }

  if (!favs?.length) {
    return NextResponse.json({ favorites: [] });
  }

  const ids = favs.map((f) => f.recipe_id);
  const { data: recipes, error: recErr } = await auth.supabase
    .from("recipes")
    .select("*")
    .in("id", ids);

  if (recErr) {
    console.error(recErr);
    return NextResponse.json({ error: "Failed to load recipes" }, { status: 500 });
  }

  const byId = new Map((recipes ?? []).map((r) => [r.id, r]));
  const favorites = favs
    .map((f) => {
      const recipe = byId.get(f.recipe_id);
      if (!recipe) return null;
      return {
        notes: f.notes,
        collection_id: f.collection_id,
        created_at: f.created_at,
        recipe,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const r = parsed.data.recipe;

  const { data: recipeRow, error: insertRecipeError } = await auth.supabase
    .from("recipes")
    .insert({
      user_id: auth.user.id,
      name: r.name,
      ingredients: r.ingredients,
      instructions: r.steps,
      cook_time_minutes: r.cook_time_minutes,
      difficulty: r.difficulty,
      servings: r.servings,
      source: "ai_generated",
    })
    .select("id")
    .single();

  if (insertRecipeError || !recipeRow) {
    console.error(insertRecipeError);
    return NextResponse.json({ error: "Could not save recipe" }, { status: 500 });
  }

  const { error: favError } = await auth.supabase.from("favorite_recipes").insert({
    user_id: auth.user.id,
    recipe_id: recipeRow.id,
    collection_id: parsed.data.collectionId ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (favError) {
    console.error(favError);
    return NextResponse.json({ error: "Could not favorite" }, { status: 500 });
  }

  return NextResponse.json({ recipeId: recipeRow.id });
}

export async function DELETE(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const recipeId = new URL(req.url).searchParams.get("recipeId");
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("favorite_recipes")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("recipe_id", recipeId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
