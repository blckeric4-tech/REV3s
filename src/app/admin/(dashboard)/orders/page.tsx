import Link from "next/link";
import { db } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { updateOrderStatus } from "@/app/admin/actions";
import { getTranslator } from "@/lib/i18n";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-line text-fg/70",
  PAID: "border-fg bg-fg text-fg",
  SHIPPED: "border-fg bg-inverse text-inverse-fg",
  DELIVERED: "border-fg bg-inverse text-inverse-fg",
  CANCELLED: "border-line text-fg/70 line-through",
  REFUNDED: "border-fg text-fg",
  EXPIRED: "border-line text-fg/70",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";

  const [settings, orders, counts, { t }] = await Promise.all([
    getSettings(),
    db.order.findMany({
      where: status && STATUSES.includes(status) ? { status } : {},
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.order.groupBy({ by: ["status"], _count: { status: true } }),
    getTranslator(),
  ]);

  const countBy = new Map(counts.map((c) => [c.status, c._count.status]));

  return (
    <div className="space-y-8">
      <div>
        <p className="label-xs text-fg/65">{t("admin.fulfilment")}</p>
        <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">{t("admin.orders")}</h1>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <StatusChip href="/admin/orders" active={!status}>
          All
        </StatusChip>
        {STATUSES.map((s) => (
          <StatusChip
            key={s}
            href={`/admin/orders?status=${s}`}
            active={status === s}
          >
            {s} {countBy.get(s) ? `(${countBy.get(s)})` : ""}
          </StatusChip>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line py-16 text-center text-sm text-fg/65">
          {t("admin.noOrdersHere")}
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-sm font-bold hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                    <span
                      className={`label-xs rounded-full border px-2 py-1 ${STATUS_STYLE[o.status] ?? ""}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold break-anywhere">{o.fullName}</p>
                  <p className="break-anywhere text-xs text-fg/65">{o.email}</p>
                  <p className="mt-1.5 text-xs text-fg/70">
                    {o.items.length} item{o.items.length === 1 ? "" : "s"} &middot;{" "}
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold">
                    {formatMoney(o.totalCents, o.currency)}
                  </p>
                  <form
                    action={updateOrderStatus}
                    className="flex w-full items-center gap-2 sm:w-auto"
                  >
                    <input type="hidden" name="id" value={o.id} />
                    <select
                      name="status"
                      defaultValue={o.status}
                      className="field w-auto py-1.5 text-xs"
                      aria-label={`${t("admin.status")} — ${o.orderNumber}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="label-xs shrink-0 border border-line px-3 py-2 hover:border-fg"
                    >
                      {t("admin.save")}
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-fg/65">
        Revenue figures use {settings.currency.toUpperCase()}. Showing the 100 most recent
        orders.
      </p>
    </div>
  );
}

function StatusChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`label-xs shrink-0 rounded-full border px-4 py-2.5 ${
        active ? "border-fg bg-fg text-bg" : "border-line text-fg/65 hover:border-fg"
      }`}
    >
      {children}
    </Link>
  );
}
