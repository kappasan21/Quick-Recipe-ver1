import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { ChefHat, Clock, Calendar } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-16 px-4 py-16">
        <section className="flex flex-col gap-6 text-center sm:text-left">
          <p className="text-sm font-medium text-muted-foreground">QuickChef</p>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {t("ctaDashboard")}
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {t("ctaLogin")}
            </Link>
          </div>
        </section>
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ChefHat className="mb-3 size-8 text-primary" />
            <p className="font-medium">{t("featureAuth")}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <Clock className="mb-3 size-8 text-primary" />
            <p className="font-medium">{t("featureFast")}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <Calendar className="mb-3 size-8 text-primary" />
            <p className="font-medium">{t("featurePlan")}</p>
          </div>
        </section>
      </main>
    </>
  );
}
