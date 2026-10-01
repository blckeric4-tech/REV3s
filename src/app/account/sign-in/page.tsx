import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/customer-auth";
import { AuthForm } from "@/components/account/auth-form";

export const metadata = { title: "Sign in" };

type SP = Promise<{ next?: string | string[] }>;

/** Only allow same-site paths back, so `?next=` cannot be used as an open redirect. */
function safeNext(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function SignInPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  if (await getCustomer()) redirect("/account");

  return (
    <div className="container-rav3s flex min-h-[calc(100svh-4rem)] items-center justify-center py-16 md:min-h-[calc(100svh-5rem)] md:py-24">
      <AuthForm mode="sign-in" next={safeNext(sp.next)} />
    </div>
  );
}
