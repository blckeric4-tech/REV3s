"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", key: null },
  { href: "/admin/products", label: "Products", key: "products" as const },
  { href: "/admin/orders", label: "Orders", key: "orders" as const },
  { href: "/admin/settings", label: "Site editor", key: null },
];

type Counts = { products: number; lowStock: number; orders: number };

export function AdminNav({ counts }: { counts: Counts }) {
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-inverse/15 p-3 lg:flex-col lg:border-b-0 lg:p-4">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const badge =
          link.key === "products"
            ? counts.products
            : link.key === "orders"
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
            <span>{link.label}</span>
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
          {counts.lowStock} variant{counts.lowStock === 1 ? "" : "s"} low on stock
        </p>
      ) : null}
    </nav>
  );
}
