import { describe, expect, it } from "vitest";
import { generateResponseSchema } from "@/lib/recipe-schema";

describe("generateResponseSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = generateResponseSchema.safeParse({
      recipes: [
        {
          name: "Test",
          cook_time_minutes: 20,
          difficulty: "easy",
          servings: 2,
          ingredients: [{ name: "egg", have: true }],
          steps: [{ text: "Cook", timer_seconds: 60 }],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects cook time over 29 minutes", () => {
    const parsed = generateResponseSchema.safeParse({
      recipes: [
        {
          name: "Test",
          cook_time_minutes: 45,
          difficulty: "easy",
          servings: 2,
          ingredients: [{ name: "egg" }],
          steps: [{ text: "Cook" }],
        },
      ],
    });
    expect(parsed.success).toBe(false);
  });
});
