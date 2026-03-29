import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/signup" className="underline">
              {t("signupLink")}
            </Link>
          </p>
        </div>
        <LoginForm />
        <p className="text-sm">
          <Link href="/forgot-password" className="underline">
            {t("forgotLink")}
          </Link>
        </p>
      </main>
    </>
  );
}
