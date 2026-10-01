import Link from "next/link";
import { db } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { stripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const settings = await getSettings();

  const [
    orderCount,
    paidCount,
    subscriberCount,
    productTotal,
    lowStock,
    recentOrders,
    revenue,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
    db.newsletterSubscriber.count(),
    db.product.count(),
    db.variant.findMany({
      where: { stock: { lte: settings.lowStockThreshold }, product: { active: true } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 6,
    }),
    db.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _sum: { totalCents: true },
    }),
  ]);

  const stats = [
    {
      label: "Revenue",
      value: formatMoney(revenue._sum.totalCents ?? 0, settings.currency),
      hint: "Paid orders",
    },
    { label: "Orders", value: String(orderCount), hint: `${paidCount} paid` },
    { label: "Products", value: String(productTotal), hint: "In the catalogue" },
    { label: "Subscribers", value: String(subscriberCount), hint: "Newsletter" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs text-fg/65">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">Overview</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn btn-primary">
            New product
          </Link>
          <Link href="/admin/settings" className="btn btn-outline">
            Edit site
          </Link>
        </div>
      </div>

      {!stripeConfigured() ? (
        <div className="rounded-[var(--radius-card)] border border-fg/40 bg-fg/10 p-5">
          <p className="text-sm font-semibold">Payments are not connected yet</p>
          <p className="mt-1.5 text-sm text-fg/70">
            Add <code className="font-mono text-xs">STRIPE_SECRET_KEY</code> to your{" "}
            <code className="font-mono text-xs">.env</code> file to enable checkout. Copy{" "}
            <code className="font-mono text-xs">.env.example</code> to get started.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="label-xs text-fg/65">{s.label}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-fg/65">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase">Recent orders</h2>
            <Link href="/admin/orders" className="label-xs text-fg/70 hover:text-fg">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line py-10 text-center text-sm text-fg/65">
              No orders yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 hover:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.fullName}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-fg/65">
                        {o.orderNumber} &middot; {o.items.length} item
                        {o.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {formatMoney(o.totalCents, o.currency)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-fg/65">{o.status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase">Low stock</h2>
            <Link href="/admin/products" className="label-xs text-fg/70 hover:text-fg">
              Restock
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line py-10 text-center text-sm text-fg/65">
              Everything is well stocked.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full ring-1 ring-fg/15"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{v.product.name}</p>
                      <p className="text-[11px] text-fg/65">
                        {v.color} / {v.size}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-bold ${
                      v.stock === 0 ? "text-fg" : "text-fg"
                    }`}
                  >
                    {v.stock} left
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
