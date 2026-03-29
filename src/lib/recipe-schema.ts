import { z } from "zod";

export const recipeIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional(),
  category: z.string().optional(),
  have: z.boolean().optional(),
});

export const recipeStepSchema = z.object({
  text: z.string().min(1),
  timer_seconds: z.number().int().min(0).max(7200).optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(1),
  cook_time_minutes: z.number().int().min(1).max(29),
  difficulty: z.enum(["easy", "medium", "hard"]),
  servings: z.number().int().min(1).max(24),
  ingredients: z.array(recipeIngredientSchema).min(1),
  steps: z.array(recipeStepSchema).min(1),
});

export const generateResponseSchema = z.object({
  recipes: z.array(recipeSchema).min(1).max(5),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;
