import Link from "next/link";
import type { Metadata } from "next";
import type { CustomerSession } from "@/lib/customer-auth";
import { getTranslator } from "@/lib/i18n";
import { AccountNav } from "@/components/account/account-nav";
import { Avatar } from "@/components/account/avatar";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.myAccount") };
}

export type AccountOrderSummary = {
  orderNumber: string;
  status: string;
  totalCents: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
};

export async function AccountShell({
  customer,
  memberSince,
  active,
  children,
}: {
  customer: CustomerSession;
  /** Creation date of the account row, for the "member since" line. */
  memberSince: Date;
  /** Which tab to highlight. */
  active: "overview" | "orders" | "details";
  children: React.ReactNode;
}) {
  const { t, locale } = await getTranslator();

  /* `timeZone: "UTC"` because the stored date is a UTC midnight; without it a
     shopper west of Greenwich would see the previous month. */
  const memberSinceLabel = memberSince.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="container-rav3s py-12 md:py-16">
      {/* ── Identity header ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Avatar
            name={customer.name}
            src={customer.avatarUrl}
            size={80}
            className="ring-1 ring-line"
            priority
          />
          <div className="min-w-0">
            <p className="label-xs text-haze">{t("account.yourAccount")}</p>
            <h1 className="mt-1.5 truncate text-2xl font-black uppercase md:text-3xl">
              {customer.name}
            </h1>
            <p className="mt-1 truncate text-sm text-fg/70">{customer.email}</p>
          </div>
        </div>

        <dl className="flex items-center gap-6 sm:gap-8">
          <div>
            <dt className="label-xs text-haze">{t("account.memberSince")}</dt>
            <dd className="mt-1.5 text-sm font-semibold">{memberSinceLabel}</dd>
          </div>
        </dl>
      </header>

      <AccountNav active={active} locale={locale} />
      {children}
    </div>
  );
}

/** Empty state shared by the orders list and the overview's recent-orders card. */
export function AccountEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-line px-6 py-16 text-center">
      <p className="font-display text-lg uppercase">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg/70">{body}</p>
      <Link href={action.href} className="btn btn-primary mt-6">
        {action.label}
      </Link>
    </div>
  );
}