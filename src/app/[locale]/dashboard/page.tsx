import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { DashboardClient } from "./dashboard-client";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
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
      <DashboardClient />
    </>
  );
}
