import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCustomer } from "@/lib/customer-auth";
import { getTranslator } from "@/lib/i18n";
import { AuthForm } from "@/components/account/auth-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.signInTitle") };
}

type SP = Promise<{ next?: string | string[] }>;

/** Only allow same-site paths back, so `?next=` cannot be used as an open redirect. */
function safeNext(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function SignInPage({ searchParams }: { searchParams: SP }) {
  const [{ locale }, sp] = await Promise.all([getTranslator(), searchParams]);
  if (await getCustomer()) redirect("/account");

  return (
    <div className="container-rav3s flex min-h-[calc(100svh-4rem)] items-center justify-center py-16 md:min-h-[calc(100svh-5rem)] md:py-24">
      <AuthForm mode="sign-in" next={safeNext(sp.next)} locale={locale} />
    </div>
  );
}