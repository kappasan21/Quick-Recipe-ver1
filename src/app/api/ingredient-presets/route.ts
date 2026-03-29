import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";

const ingredientItemSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional(),
  category: z.string().optional(),
});

const postSchema = z.object({
  name: z.string().min(1).max(80),
  ingredients: z.array(ingredientItemSchema).min(1).max(200),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("ingredient_presets")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load presets" }, { status: 500 });
  }

  return NextResponse.json({ presets: data ?? [] });
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("ingredient_presets")
    .insert({
      user_id: auth.user.id,
      name: parsed.data.name,
      ingredients: parsed.data.ingredients,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ preset: data });
}

export async function DELETE(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("ingredient_presets")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
