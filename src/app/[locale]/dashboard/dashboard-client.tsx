"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Recipe } from "@/types/recipe";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, addDays, parseISO } from "date-fns";

const DIETS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
] as const;

function parseIngredients(raw: string): string[] {
  return raw
    .split(/[\n,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ShoppingBlock({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  if (!lines.length) return null;
  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm">
      <p className="font-medium">{title}</p>
      <ul className="mt-2 list-inside list-disc">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardClient() {
  const t = useTranslations("dashboard");
  const tDiff = useTranslations("difficulty");
  const locale = useLocale() as "ja" | "en";

  const [tab, setTab] = useState("generate");

  const [ingredientText, setIngredientText] = useState("");
  const [diets, setDiets] = useState<string[]>([]);
  const [customDiet, setCustomDiet] = useState("");
  const [generating, setGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [favorites, setFavorites] = useState<
    {
      recipe: Record<string, unknown>;
      notes: string | null;
      collection_id: string | null;
    }[]
  >([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [newCollection, setNewCollection] = useState("");
  const [collectionId, setCollectionId] = useState<string>("_none");

  const [presets, setPresets] = useState<
    { id: string; name: string; ingredients: unknown }[]
  >([]);

  const [profile, setProfile] = useState({
    display_name: "",
    skill_level: "beginner" as "beginner" | "intermediate" | "advanced",
    dietary_restrictions: [] as string[],
    favorite_cuisines: "",
  });

  const [weekStart, setWeekStart] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [mealEntries, setMealEntries] = useState<Record<string, string>>({});

  const loadFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites");
    if (!res.ok) return;
    const data = await res.json();
    setFavorites(data.favorites ?? []);
  }, []);

  const loadCollections = useCallback(async () => {
    const res = await fetch("/api/collections");
    if (!res.ok) return;
    const data = await res.json();
    setCollections(data.collections ?? []);
  }, []);

  const loadPresets = useCallback(async () => {
    const res = await fetch("/api/ingredient-presets");
    if (!res.ok) return;
    const data = await res.json();
    setPresets(data.presets ?? []);
  }, []);

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (!res.ok) return;
    const data = await res.json();
    const p = data.profile;
    if (!p) return;
    setProfile({
      display_name: p.display_name ?? "",
      skill_level: p.skill_level ?? "beginner",
      dietary_restrictions: p.dietary_restrictions ?? [],
      favorite_cuisines: (p.favorite_cuisines ?? []).join(", "),
    });
  }, []);

  const loadMealPlan = useCallback(async () => {
    const res = await fetch("/api/meal-plans");
    if (!res.ok) return;
    const data = await res.json();
    const plans = data.mealPlans ?? [];
    const match = plans.find(
      (p: { week_start_date: string }) => p.week_start_date === weekStart,
    );
    if (match?.entries) {
      setMealEntries(match.entries as Record<string, string>);
    } else {
      setMealEntries({});
    }
  }, [weekStart]);

  useEffect(() => {
    void loadFavorites();
    void loadCollections();
    void loadPresets();
    void loadProfile();
  }, [loadFavorites, loadCollections, loadPresets, loadProfile]);

  useEffect(() => {
    void loadMealPlan();
  }, [loadMealPlan, weekStart]);

  async function generate() {
    const ingredients = parseIngredients(ingredientText);
    if (!ingredients.length) {
      toast.error(locale === "ja" ? "食材を入力してください" : "Add ingredients");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          dietaryRestrictions: diets,
          customRestriction: customDiet || undefined,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "fail");
      setRecipes(data.recipes ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function saveFavorite(
    recipe: Recipe,
    col: string | null,
    notes: string,
  ) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipe,
        collectionId: col,
        notes: notes || null,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success(locale === "ja" ? "保存しました" : "Saved");
    void loadFavorites();
  }

  async function removeFavorite(recipeId: string) {
    const res = await fetch(`/api/favorites?recipeId=${recipeId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Remove failed");
      return;
    }
    void loadFavorites();
  }

  async function createCollection() {
    if (!newCollection.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCollection.trim() }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    setNewCollection("");
    void loadCollections();
  }

  async function savePreset(name: string, ingredients: string) {
    const items = parseIngredients(ingredients).map((name) => ({ name }));
    if (!items.length) return;
    const res = await fetch("/api/ingredient-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ingredients: items }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    void loadPresets();
  }

  async function deletePreset(id: string) {
    const res = await fetch(`/api/ingredient-presets?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    void loadPresets();
  }

  async function saveProfile() {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: profile.display_name || null,
        skill_level: profile.skill_level,
        dietary_restrictions: profile.dietary_restrictions,
        favorite_cuisines: profile.favorite_cuisines
          .split(/[,、]/)
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("OK");
  }

  async function saveMealPlan() {
    const cleaned: Record<string, string> = {};
    Object.entries(mealEntries).forEach(([k, v]) => {
      if (v && v !== "_none") cleaned[k] = v;
    });
    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        week_start_date: weekStart,
        entries: cleaned,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("OK");
  }

  const weekDates = useMemo(() => {
    const start = parseISO(weekStart);
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), "yyyy-MM-dd"),
    );
  }, [weekStart]);

  const favoriteRecipeOptions = favorites.map((f) => ({
    id: f.recipe.id as string,
    name: (f.recipe.name as string) ?? "",
  }));

  const planShoppingLines = useMemo(() => {
    const ids = new Set(
      Object.values(mealEntries).filter((v) => v && v !== "_none"),
    );
    const map = new Map(
      favorites.map((f) => [f.recipe.id as string, f.recipe]),
    );
    const missing = new Set<string>();
    ids.forEach((id) => {
      const r = map.get(id);
      if (!r) return;
      const ings = (r.ingredients as { name: string; have?: boolean }[]) ?? [];
      ings.forEach((i) => {
        if (i.have === false) missing.add(i.name);
      });
    });
    return Array.from(missing);
  }, [mealEntries, favorites]);

  function toggleDiet(id: string) {
    setDiets((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  function toggleProfileDiet(id: string) {
    setProfile((p) => ({
      ...p,
      dietary_restrictions: p.dietary_restrictions.includes(id)
        ? p.dietary_restrictions.filter((x) => x !== id)
        : [...p.dietary_restrictions, id],
    }));
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="generate">{t("tabGenerate")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("tabFavorites")}</TabsTrigger>
          <TabsTrigger value="meal">{t("tabMeal")}</TabsTrigger>
          <TabsTrigger value="presets">{t("tabPresets")}</TabsTrigger>
          <TabsTrigger value="profile">{t("tabProfile")}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabGenerate")}</CardTitle>
              <CardDescription>{t("ingredientsHint")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>{t("ingredientsLabel")}</Label>
                <Textarea
                  rows={5}
                  value={ingredientText}
                  onChange={(e) => setIngredientText(e.target.value)}
                  placeholder="tomato, egg, rice"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("dietLabel")}</Label>
                <div className="flex flex-wrap gap-3">
                  {DIETS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={diets.includes(d)}
                        onCheckedChange={() => toggleDiet(d)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t("customDiet")}</Label>
                <Input
                  value={customDiet}
                  onChange={(e) => setCustomDiet(e.target.value)}
                />
              </div>
              <Button onClick={() => void generate()} disabled={generating}>
                {generating ? t("generating") : t("generate")}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((r, idx) => {
              const missing = r.ingredients
                .filter((i) => i.have === false)
                .map((i) =>
                  i.amount ? `${i.name} (${i.amount})` : i.name,
                );
              return (
                <Card key={`${r.name}-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {r.cook_time_minutes} {t("minutes")}
                      </Badge>
                      <Badge>{tDiff(r.difficulty)}</Badge>
                      <Badge variant="outline">
                        {r.servings} {t("servings")}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ShoppingBlock title={t("missing")} lines={missing} />
                    <Separator />
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={collectionId}
                        onValueChange={(v) =>
                          setCollectionId(v ?? "_none")
                        }
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder={t("collection")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">
                            {locale === "ja" ? "（なし）" : "(None)"}
                          </SelectItem>
                          {collections.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void saveFavorite(
                            r,
                            collectionId === "_none" ? null : collectionId,
                            "",
                          )
                        }
                      >
                        {t("saveFavorite")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {locale === "ja"
                        ? "保存後、お気に入りタブから調理モードを開けます。"
                        : "After saving, open cooking mode from the Favorites tab."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder={t("collectionsNew")}
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="secondary" onClick={createCollection}>
              +
            </Button>
          </div>
          {favorites.map((f) => {
            const r = f.recipe;
            const id = r.id as string;
            const ings = (r.ingredients as { name: string; have?: boolean }[]) ?? [];
            const missing = ings
              .filter((i) => i.have === false)
              .map((i) => i.name);
            return (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>{r.name as string}</CardTitle>
                  <CardDescription>
                    {f.notes ? `${t("notes")}: ${f.notes}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <ShoppingBlock title={t("shopping")} lines={missing} />
                  <Link
                    href={`/cook/${id}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    {t("cook")}
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void removeFavorite(id)}
                  >
                    {locale === "ja" ? "解除" : "Remove"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="meal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabMeal")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 max-w-xs">
                <Label>{t("weekStart")}</Label>
                <Input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {weekDates.map((d) => (
                  <div key={d} className="grid gap-1">
                    <Label className="text-xs">{d}</Label>
                    <Select
                      value={mealEntries[d] ?? "_none"}
                      onValueChange={(v) =>
                        setMealEntries((m) => {
                          const next = { ...m };
                          if (!v || v === "_none") {
                            delete next[d];
                          } else {
                            next[d] = v;
                          }
                          return next;
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">
                          {locale === "ja" ? "なし" : "None"}
                        </SelectItem>
                        {favoriteRecipeOptions.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button onClick={() => void saveMealPlan()}>{t("savePlan")}</Button>
              <ShoppingBlock
                title={t("planShopping")}
                lines={planShoppingLines}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <PresetEditor
            onSave={(name, text) => void savePreset(name, text)}
            t={t}
            locale={locale}
          />
          {presets.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const raw = p.ingredients as { name?: string }[];
                      const line = Array.isArray(raw)
                        ? raw.map((i) => i.name ?? "").filter(Boolean).join("\n")
                        : "";
                      setIngredientText(line);
                      setTab("generate");
                    }}
                  >
                    {t("loadPreset")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void deletePreset(p.id)}
                  >
                    {t("deletePreset")}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabProfile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="grid gap-2">
                <Label>{t("displayName")}</Label>
                <Input
                  value={profile.display_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, display_name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("skill")}</Label>
                <Select
                  value={profile.skill_level}
                  onValueChange={(v) =>
                    setProfile((p) => ({
                      ...p,
                      skill_level: v as typeof profile.skill_level,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">beginner</SelectItem>
                    <SelectItem value="intermediate">intermediate</SelectItem>
                    <SelectItem value="advanced">advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("dietLabel")}</Label>
                <div className="flex flex-wrap gap-3">
                  {DIETS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={profile.dietary_restrictions.includes(d)}
                        onCheckedChange={() => toggleProfileDiet(d)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{locale === "ja" ? "好きな料理" : "Favorite cuisines"}</Label>
                <Input
                  value={profile.favorite_cuisines}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      favorite_cuisines: e.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={() => void saveProfile()}>{t("saveProfile")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function PresetEditor({
  onSave,
  t,
  locale,
}: {
  onSave: (name: string, text: string) => void;
  t: (k: string) => string;
  locale: string;
}) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tabPresets")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-w-lg">
        <div className="grid gap-2">
          <Label>{t("presetName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>{t("ingredientsLabel")}</Label>
          <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!name.trim()) {
              toast.error(locale === "ja" ? "名前を入力" : "Name required");
              return;
            }
            onSave(name.trim(), text);
            setName("");
            setText("");
          }}
        >
          {t("savePreset")}
        </Button>
      </CardContent>
    </Card>
  );
}
