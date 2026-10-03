import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { getTranslator } from "@/lib/i18n";
import { statusKey } from "@/lib/i18n/translate";
import { AccountEmpty, AccountShell } from "./account-shell";
import { ProfilePhotoCard } from "@/components/account/profile-photo-card";
import { ArrowRightIcon, RulerIcon, SettingsIcon, TruckIcon, UploadIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.myAccount") };
}

/** Orders still on their way. Everything else is settled. */
const IN_FLIGHT = ["PENDING", "PAID", "SHIPPED"];

export default async function AccountPage() {
  const [{ t, locale, tag }, customer] = await Promise.all([
    getTranslator(),
    requireCustomer("/account"),
  ]);

  // One round trip for everything the overview needs. Scoped by customerId —
  // never by email, which a visitor could type into a form.
  const [account, orders, spend, delivered, inFlightCount, currencies] = await Promise.all([
    db.customer.findUniqueOrThrow({
      where: { id: customer.id },
      select: { createdAt: true, avatarUrl: true },
    }),
    db.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        orderNumber: true,
        status: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        items: { select: { image: true, name: true, quantity: true } },
        _count: { select: { items: true } },
      },
    }),
    // Cancelled/refunded orders are money the shopper did not actually spend.
    db.order.aggregate({
      where: {
        customerId: customer.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    db.order.count({ where: { customerId: customer.id, status: "DELIVERED" } }),
    db.order.count({ where: { customerId: customer.id, status: { in: IN_FLIGHT } } }),
    // Mixed currencies would make a single lifetime total meaningless.
    db.order.findMany({
      where: { customerId: customer.id },
      distinct: ["currency"],
      select: { currency: true },
    }),
  ]);

  const orderCount = spend._count;
  const spent = spend._sum.totalCents ?? 0;
  const lifetimeSpend =
    currencies.length === 1 && spent > 0
      ? formatMoney(spent, currencies[0].currency, tag)
      : null;

  return (
    <AccountShell customer={customer} memberSince={account.createdAt} active="overview">
      {/* ── Profile photo ───────────────────────────────────────────── */}
      {/* First thing a new account sees, so the upload is not buried. */}
      <ProfilePhotoCard
        name={customer.name}
        avatarUrl={account.avatarUrl}
      />

      {/* ── At a glance ─────────────────────────────────────────────── */}
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="stat-tile">
          <dt>{t("account.ordersPlaced")}</dt>
          <dd>{orderCount}</dd>
        </div>
        <div className="stat-tile">
          <dt>{t("account.inProgress")}</dt>
          <dd>{inFlightCount}</dd>
        </div>
        <div className="stat-tile">
          <dt>{t("account.delivered")}</dt>
          <dd>{delivered}</dd>
        </div>
        <div className="stat-tile">
          <dt>{t("account.lifetimeSpend")}</dt>
          <dd className={lifetimeSpend ? "" : "text-haze"}>{lifetimeSpend ?? "—"}</dd>
        </div>
      </dl>

      {/* ── Recent orders ───────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg uppercase">{t("account.recentOrders")}</h2>
          {orderCount > 3 ? (
            <Link
              href="/account/orders"
              className="label-xs text-fg/70 underline-offset-4 hover:text-fg hover:underline"
            >
              {t("account.viewAllCount", { count: orderCount })}
            </Link>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="mt-4">
            <AccountEmpty
              title={t("account.noOrdersTitle")}
              body={t("account.noOrdersOverviewBody")}
              action={{ href: "/shop", label: t("account.browseRange") }}
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {orders.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-surface-2 md:gap-6"
                >
                  {/* Overlapping thumbnails: reads as "these are the things". */}
                  <span className="flex shrink-0 -space-x-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span
                        key={`${item.name}-${i}`}
                        className="media-mat relative h-14 w-12 overflow-hidden rounded-md border border-line ring-2 ring-bg"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="3rem"
                          className="media-fit"
                        />
                      </span>
                    ))}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-bold">{order.orderNumber}</span>
                    <span className="mt-1 block text-xs text-fg/65">
                      {new Date(order.createdAt).toLocaleDateString(locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {order._count.items}{" "}
                      {t(order._count.items === 1 ? "account.item" : "account.items")}
                    </span>
                  </span>

                  <span className="hidden sm:block">
                    <span className="status-pill" data-status={order.status}>
                      {statusKey(order.status) ? t(statusKey(order.status)!) : order.status}
                    </span>
                  </span>

                  <span className="shrink-0 text-sm font-semibold">
                    {formatMoney(order.totalCents, order.currency, tag)}
                  </span>

                  <span
                    aria-hidden
                    className="shrink-0 text-fg/30 transition-transform group-hover:translate-x-0.5 group-hover:text-fg"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Shortcuts ───────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="font-display text-lg uppercase">{t("account.needSomething")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/account/details",
              Icon: account.avatarUrl ? SettingsIcon : UploadIcon,
              kicker: t("account.accountSection"),
              title: t("account.yourDetails"),
              body: t(
                account.avatarUrl
                  ? "account.detailsBody"
                  : "account.detailsBodyEmpty"
              ),
            },
            {
              href: "/size-guide",
              Icon: RulerIcon,
              kicker: t("account.help"),
              title: t("sizeGuide.title"),
              body: t("account.sizeGuideCardBody"),
            },
            {
              href: "/shipping",
              Icon: TruckIcon,
              kicker: t("account.help"),
              title: t("shipping.heading"),
              body: t("account.shippingCardBody"),
            },
          ].map(({ href, Icon, kicker, title, body }) => (
            <Link key={href} href={href} className="card p-5 transition-colors hover:border-fg">
              <div className="flex items-start justify-between gap-3">
                <p className="label-xs text-haze">{kicker}</p>
                <Icon className="h-4 w-4 shrink-0 text-haze" />
              </div>
              <p className="mt-3 font-display text-sm uppercase">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-fg/70">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </AccountShell>
  );
}