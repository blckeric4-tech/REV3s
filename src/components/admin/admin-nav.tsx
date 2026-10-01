"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, TranslationKey } from "@/lib/i18n/translate";
import { makeTranslator } from "@/lib/i18n/translate";

const LINKS = [
  { href: "/admin", labelKey: "admin.overview", badge: null },
  { href: "/admin/products", labelKey: "admin.products", badge: "products" },
  { href: "/admin/orders", labelKey: "admin.orders", badge: "orders" },
  { href: "/admin/settings", labelKey: "admin.siteEditor", badge: null },
] as const satisfies readonly {
  href: string;
  labelKey: TranslationKey;
  badge: "products" | "orders" | null;
}[];

type Counts = { products: number; lowStock: number; orders: number };

export function AdminNav({ counts, locale }: { counts: Counts; locale: Locale }) {
  const t = makeTranslator(locale);
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-inverse/15 p-3 lg:flex-col lg:border-b-0 lg:p-4">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const badge =
          link.badge === "products"
            ? counts.products
            : link.badge === "orders"
              ? counts.orders
              : null;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`label-xs flex shrink-0 items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors ${
              active
                ? "bg-inverse-fg text-inverse"
                : "text-inverse-fg/75 hover:bg-inverse-fg/10 hover:text-inverse-fg"
            }`}
          >
            <span>{t(link.labelKey)}</span>
            {badge ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-inverse text-inverse-fg" : "bg-inverse-fg/15 text-inverse-fg"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}

      {counts.lowStock > 0 ? (
        <p className="px-4 pt-4 text-[10px] leading-relaxed text-inverse-fg/70">
          {t(
            counts.lowStock === 1 ? "admin.lowStockWarning" : "admin.lowStockWarningPlural",
            { count: counts.lowStock }
          )}
        </p>
      ) : null}
    </nav>
  );
}
