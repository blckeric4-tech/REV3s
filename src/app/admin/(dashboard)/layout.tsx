import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getTranslator } from "@/lib/i18n";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const { t, locale } = await getTranslator();

  const [productCount, lowStock, pending] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.variant.count({ where: { stock: { lte: 5 } } }),
    db.order.count({ where: { status: "PAID" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-line bg-inverse text-inverse-fg lg:w-64 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-line">
        <div className="flex items-center justify-between p-5 lg:block">
          <Link href="/" className="text-xl font-black tracking-[-0.06em]">
            RAV3S
            <span className="ml-1 inline-block h-2 w-2 rounded-full align-top bg-inverse-fg" />
            <span className="ml-2 align-middle text-[10px] font-normal uppercase tracking-[0.2em] text-inverse-fg/70">
              {t("admin.title")}
            </span>
          </Link>
        </div>

        <AdminNav
          counts={{ products: productCount, lowStock, orders: pending }}
          locale={locale}
        />

        <div className="border-t border-inverse-fg/20 p-4 lg:mt-auto lg:p-5">
          <p className="text-xs text-inverse-fg/70">
            {t("admin.signedInAs")}{" "}
            <span className="break-anywhere text-inverse-fg">{user.email}</span>
          </p>
          {/* On a phone these stack full-height and push the dashboard itself
              a long way down the page, so they sit in a row until lg. */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row lg:mt-4 lg:flex-col">
            <div className="flex justify-center pb-1 lg:hidden">
              <ThemeToggle
                variant="labelled"
                className="border-inverse-fg/30 text-inverse-fg hover:bg-inverse-fg hover:text-inverse"
              />
            </div>
            <Link
              href="/"
              className="label-xs flex-1 border border-inverse-fg/30 px-3 py-2.5 text-center transition-colors hover:bg-inverse-fg hover:text-inverse"
            >
              {t("admin.viewSite")}
            </Link>
            {/* Signing out is not undoable, so it asks first. */}
            <ConfirmButton
              action={logout}
              label={t("admin.signOut")}
              title={t("admin.signOutTitle")}
              body={t("admin.signOutBody")}
              confirmLabel={t("admin.signOut")}
              cancelLabel={t("admin.staySignedIn")}
              subject={user.email}
              className="label-xs flex-1 border border-inverse-fg/30 px-3 py-2.5 text-center transition-colors hover:bg-inverse-fg hover:text-inverse"
            />
          </div>
          <div className="mt-3">
            <LanguageSwitcher current={locale} variant="menu" />
          </div>
          <div className="mt-3 hidden justify-center lg:flex">
            <ThemeToggle
              variant="labelled"
              className="border-inverse-fg/30 text-inverse-fg hover:bg-inverse-fg hover:text-inverse"
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</div>
      </div>
    </div>
  );
}
