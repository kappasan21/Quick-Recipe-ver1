import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";

const entriesSchema = z.record(z.string(), z.string().uuid());

const upsertSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: entriesSchema,
});

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("week_start_date", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load meal plans" }, { status: 500 });
  }

  return NextResponse.json({ mealPlans: data ?? [] });
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

  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("meal_plans")
    .upsert(
      {
        user_id: auth.user.id,
        week_start_date: parsed.data.week_start_date,
        entries: parsed.data.entries,
      },
      { onConflict: "user_id,week_start_date" },
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ mealPlan: data });
}

export async function PUT(req: Request) {
  return POST(req);
}
