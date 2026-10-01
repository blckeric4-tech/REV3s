import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { updateOrderStatus } from "@/app/admin/actions";

export const metadata = { title: "Order" };
export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/orders" className="label-xs text-fg/65 hover:text-fg">
          &larr; Orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-black md:text-3xl">{order.orderNumber}</h1>
          <span className="label-xs rounded-full bg-inverse px-3 py-1.5 text-inverse-fg">
            {order.status}
          </span>
        </div>
        <p className="mt-2 text-xs text-fg/65">
          Placed{" "}
          {new Date(order.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label-xs text-fg/65">Items</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="media-mat relative h-16 w-14 shrink-0 overflow-hidden rounded border border-line">
                    <Image src={item.image} alt={item.name} fill sizes="3.5rem" className="media-fit" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      target="_blank"
                      className="text-sm font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-fg/65">
                      {item.color} / {item.size} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatMoney(item.unitPriceCents * item.quantity, order.currency)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-fg/70">Subtotal</dt>
                <dd>{formatMoney(order.subtotalCents, order.currency)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 text-fg/70">Shipping</dt>
                <dd>
                  {order.shippingCents === 0
                    ? "Free"
                    : formatMoney(order.shippingCents, order.currency)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2 text-base font-bold">
                <dt className="shrink-0">Total</dt>
                <dd>{formatMoney(order.totalCents, order.currency)}</dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section className="card p-5">
              <h2 className="label-xs text-fg/65">Customer note</h2>
              <p className="mt-2 text-sm text-fg/75">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="label-xs text-fg/65">Update status</h2>
            <form action={updateOrderStatus} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="field">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary w-full">
                Save status
              </button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="label-xs text-fg/65">Customer</h2>
            <p className="mt-3 text-sm font-semibold">{order.fullName}</p>
            <p className="text-sm text-fg/70">{order.email}</p>
            {order.phone ? <p className="mt-1 text-sm text-fg/70">{order.phone}</p> : null}
            {order.email ? (
              <a
                href={`mailto:${order.email}?subject=Your RAV3S order ${order.orderNumber}`}
                className="label-xs mt-4 block border border-line px-3 py-2.5 text-center hover:border-fg"
              >
                Email customer
              </a>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="label-xs text-fg/65">Shipping address</h2>
            <p className="mt-3 text-sm text-fg/75">{order.fullName}</p>
            <p className="text-sm text-fg/75">{order.addressLine1}</p>
            {order.addressLine2 ? <p className="text-sm text-fg/75">{order.addressLine2}</p> : null}
            <p className="text-sm text-fg/75">
              {order.city} {order.postcode}
            </p>
            <p className="text-sm text-fg/75">{order.country}</p>
          </section>

          <section className="card p-5">
            <h2 className="label-xs text-fg/65">Payment</h2>
            {order.stripePaymentIntentId ? (
              <p className="mt-3 break-all font-mono text-[11px] text-fg/70">
                {order.stripePaymentIntentId}
              </p>
            ) : (
              <p className="mt-3 text-sm text-fg/65">Not paid yet</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
