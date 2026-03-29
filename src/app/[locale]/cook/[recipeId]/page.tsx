import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { CookClient } from "./cook-client";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; recipeId: string }> };

export default async function CookPage({ params }: Props) {
  const { locale, recipeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({
      href: "/login",
      locale: locale as (typeof routing.locales)[number],
    });
  }

  return (
    <>
      <SiteHeader />
      <CookClient recipeId={recipeId} />
    </>
  );
}
