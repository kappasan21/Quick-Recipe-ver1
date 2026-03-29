export type RecipeIngredient = {
  name: string;
  amount?: string;
  category?: string;
  /** User already has this ingredient */
  have?: boolean;
};

export type RecipeStep = {
  text: string;
  timer_seconds?: number;
};

export type Recipe = {
  id?: string;
  name: string;
  cook_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};
