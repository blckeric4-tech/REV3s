import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n";
import { LoginForm } from "@/components/admin/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("adminLogin.signIn") };
}

export default async function AdminLoginPage() {
  const [{ t, locale }] = await Promise.all([getTranslator()]);
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-inverse px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-3xl font-black tracking-[-0.06em] text-inverse-fg">
          RAV3S
          <span className="ml-1 inline-block h-2 w-2 rounded-full align-top bg-inverse-fg" />
        </p>
        <p className="label-xs mt-2 text-inverse-fg/70">{t("adminLogin.signIn")}</p>

        <div className="mt-8 rounded-[var(--radius-card)] border border-inverse/15 bg-surface/[0.04] p-6">
          <LoginForm locale={locale} />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-inverse-fg/70">
          {t("adminLogin.note")}
        </p>
      </div>
    </div>
  );
}