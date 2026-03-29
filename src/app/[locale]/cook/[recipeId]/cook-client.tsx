"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Step = { text: string; timer_seconds?: number };

export function CookClient({ recipeId }: { recipeId: string }) {
  const t = useTranslations("cook");
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [remain, setRemain] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/recipes/${recipeId}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const r = data.recipe as {
        name: string;
        instructions: Step[] | unknown;
      };
      setName(r.name);
      const raw = Array.isArray(r.instructions) ? r.instructions : [];
      setSteps(raw as Step[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          setTimerOn(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return ((index + 1) / steps.length) * 100;
  }, [index, steps.length]);

  const current = steps[index];

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">…</p>;
  }

  if (!steps.length) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No steps found for this recipe.
      </p>
    );
  }

  function startStepTimer(sec: number) {
    setRemain(sec);
    setTimerOn(true);
  }

  function stopTimer() {
    setTimerOn(false);
    setRemain(0);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm text-muted-foreground">
          {t("step")} {index + 1} / {steps.length}
        </p>
        <Progress value={progress} className="mt-3 h-2" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("step")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed">{current?.text}</p>
          {current?.timer_seconds ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{current.timer_seconds}s</Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startStepTimer(current.timer_seconds ?? 0)}
              >
                {t("startTimer")}
              </Button>
              {timerOn && remain > 0 && (
                <span className="font-mono text-lg">{remain}s</span>
              )}
              <Button type="button" size="sm" variant="ghost" onClick={stopTimer}>
                {t("stopTimer")}
              </Button>
            </div>
          ) : null}
          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={index === 0}
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                stopTimer();
              }}
            >
              {t("prev")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (index >= steps.length - 1) return;
                setIndex((i) => i + 1);
                stopTimer();
              }}
              disabled={index >= steps.length - 1}
            >
              {index >= steps.length - 1 ? t("done") : t("next")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
