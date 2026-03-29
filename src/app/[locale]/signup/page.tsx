import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const t = await getTranslations("auth");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-8 px-4 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{t("signupTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/login" className="underline">
              {t("loginLink")}
            </Link>
          </p>
        </div>
        <SignupForm />
      </main>
    </>
  );
}
