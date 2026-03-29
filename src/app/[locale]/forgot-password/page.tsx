import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { ForgotForm } from "@/components/auth/forgot-form";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{t("forgotTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/login" className="underline">
              {t("loginLink")}
            </Link>
          </p>
        </div>
        <ForgotForm />
      </main>
    </>
  );
}
