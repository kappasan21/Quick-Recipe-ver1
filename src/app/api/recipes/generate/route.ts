import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api-auth";
import { generateRecipes } from "@/lib/gemini";

const bodySchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1).max(80),
  dietaryRestrictions: z.array(z.string()).max(20).optional().default([]),
  customRestriction: z.string().max(500).optional(),
  locale: z.enum(["ja", "en"]).optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const locale = parsed.data.locale ?? "ja";

  try {
    const result = await generateRecipes({
      ingredients: parsed.data.ingredients,
      dietaryRestrictions: parsed.data.dietaryRestrictions ?? [],
      customRestriction: parsed.data.customRestriction,
      locale,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Recipe generation failed" },
      { status: 500 },
    );
  }
}
