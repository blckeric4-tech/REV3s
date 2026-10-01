import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-inverse px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-3xl font-black tracking-[-0.06em] text-inverse-fg">
          RAV3S
          <span className="ml-1 inline-block h-2 w-2 rounded-full align-top bg-inverse-fg" />
        </p>
        <p className="label-xs mt-2 text-inverse-fg/70">Admin sign in</p>

        <div className="mt-8 rounded-[var(--radius-card)] border border-inverse/15 bg-surface/[0.04] p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-inverse-fg/70">
          Sessions are signed and httpOnly. Change the default password in Settings
          straight after your first login.
        </p>
      </div>
    </div>
  );
}
