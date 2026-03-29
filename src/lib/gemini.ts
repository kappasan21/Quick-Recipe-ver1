import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateResponseSchema, type GenerateResponse } from "@/lib/recipe-schema";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

function buildPrompt(
  ingredients: string[],
  dietary: string[],
  custom: string | undefined,
  locale: "ja" | "en",
): string {
  const diet =
    dietary.length > 0 ? dietary.join(", ") : locale === "ja" ? "指定なし" : "none";
  const extra = custom?.trim() ? `\nAdditional: ${custom}` : "";

  if (locale === "ja") {
    return `あなたは家庭向けの料理アシスタントです。次の食材を使い、調理時間が29分以内のレシピをちょうど5つ提案してください。
ユーザーが持っている食材: ${ingredients.join("、")}
食事制限・嗜好: ${diet}${extra}

厳守:
- 各レシピの調理時間は29分以下（分単位で整数）。
- 食材リストでは、ユーザーが持っていない可能性があるものは have: false、持っている可能性が高いものは have: true と推定してください。
- 手順は短く具体的に。必要なら各ステップに timer_seconds（秒）を付けてもよい。
- 応答は次のJSONだけ（説明文やマークダウン禁止）:
{
  "recipes": [
    {
      "name": string,
      "cook_time_minutes": number,
      "difficulty": "easy" | "medium" | "hard",
      "servings": number,
      "ingredients": [{ "name": string, "amount"?: string, "category"?: string, "have"?: boolean }],
      "steps": [{ "text": string, "timer_seconds"?: number }]
    }
  ]
}`;
  }

  return `You are a home cooking assistant. Using ONLY practical combinations of the user's ingredients, propose exactly 5 recipes under 30 minutes each (cook_time_minutes <= 29).
User ingredients: ${ingredients.join(", ")}
Dietary filters: ${diet}${extra}

Rules:
- cook_time_minutes must be an integer <= 29.
- For ingredients, set have: true if likely already owned, false if likely missing.
- Return JSON only (no markdown):
{
  "recipes": [
    {
      "name": string,
      "cook_time_minutes": number,
      "difficulty": "easy" | "medium" | "hard",
      "servings": number,
      "ingredients": [{ "name": string, "amount"?: string, "category"?: string, "have"?: boolean }],
      "steps": [{ "text": string, "timer_seconds"?: number }]
    }
  ]
}`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export async function generateRecipes(params: {
  ingredients: string[];
  dietaryRestrictions: string[];
  customRestriction?: string;
  locale: "ja" | "en";
}): Promise<GenerateResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const prompt = buildPrompt(
    params.ingredients,
    params.dietaryRestrictions,
    params.customRestriction,
    params.locale,
  );

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = JSON.parse(extractJson(text));
  return generateResponseSchema.parse(raw);
}
