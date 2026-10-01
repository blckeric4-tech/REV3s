import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { AccountShell } from "../../account-shell";
import { BoxIcon, CheckIcon, TruckIcon } from "@/components/icons";

export const metadata = { title: "Order" };
export const dynamic = "force-dynamic";

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const customer = await requireCustomer("/account");
  const { orderNumber } = await params;

  // The customerId filter is the authorisation check: even if someone guesses
  // another shopper's order number, the query returns nothing.
  const order = await db.order.findFirst({
    where: { orderNumber, customerId: customer.id },
    include: { items: true },
  });
  if (!order) notFound();

  const account = await db.customer.findUniqueOrThrow({
    where: { id: customer.id },
    select: { createdAt: true },
  });

  const dateFmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeFmt = (d: Date) =>
    new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Plain-language next step, so the shopper is not left guessing what a status means.
  const NEXT_STEP: Record<string, string> = {
    PENDING: "We are waiting for your payment to arrive. This updates automatically.",
    PAID: "Payment received. Your order is being prepared.",
    SHIPPED: "On its way to you.",
    DELIVERED: "Delivered. Thanks for shopping with us.",
    CANCELLED: "This order was cancelled and nothing was charged.",
    REFUNDED: "This order was refunded to the original payment method.",
  };

  return (
    <AccountShell customer={customer} memberSince={account.createdAt} active="orders">
      <Link
        href="/account/orders"
        className="label-xs text-fg/70 underline-offset-4 hover:text-fg hover:underline"
      >
        &larr; All orders
      </Link>

      {/* ── Order header ────────────────────────────────────────────── */}
      <header className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-6">
        <div>
          <p className="label-xs text-haze">Order</p>
          <h2 className="mt-1.5 font-mono text-2xl font-black md:text-3xl">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-fg/70">
            Placed {dateFmt(order.createdAt)} at {timeFmt(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <span className="status-pill" data-status={order.status}>
            {order.status}
          </span>
          <p className="mt-3 text-xs leading-relaxed text-fg/70 md:max-w-xs">
            {NEXT_STEP[order.status] ?? "We will email you if anything changes."}
          </p>
        </div>
      </header>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      <ol className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Placed", done: true, note: dateFmt(order.createdAt) },
          {
            label: "Paid",
            done: ["PAID", "SHIPPED", "DELIVERED"].includes(order.status),
            note: order.stripePaymentIntentId ? "Confirmed" : "Awaiting",
          },
          { label: "Shipped", done: ["SHIPPED", "DELIVERED"].includes(order.status) },
          { label: "Delivered", done: order.status === "DELIVERED" },
        ].map((step) => (
          <li
            key={step.label}
            className={`flex items-start gap-3 rounded-[var(--radius-card)] border p-4 ${
              step.done ? "border-fg bg-inverse text-inverse-fg" : "border-line bg-surface-2"
            }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                step.done ? "bg-inverse-fg text-inverse" : "border border-line text-haze"
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="label-xs block opacity-70">{step.label}</span>
              <span className="mt-1.5 block text-sm font-semibold">
                {step.done ? (step.note ?? "Done") : "Pending"}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ── Items ─────────────────────────────────────────────────── */}
        <section className="card overflow-hidden">
          <h3 className="label-xs border-b border-line px-5 py-4 text-haze">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </h3>

          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li
                key={item.id ?? `${item.name}-${i}`}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span className="media-mat relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-line">
                  <Image src={item.image} alt={item.name} fill sizes="4rem" className="media-fit" />
                </span>
                <span className="min-w-0 flex-1">
                  {/* Archived rows intentionally are not links: the product may
                      have been deleted since the order, and `slug` is a snapshot. */}
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className="mt-1 block text-xs text-fg/65">
                    {item.color} / {item.size}
                  </span>
                  <span className="mt-1 block text-xs text-fg/65">
                    {formatMoney(item.unitPriceCents, order.currency)} &times; {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold">
                  {formatMoney(item.unitPriceCents * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2.5 border-t border-line bg-surface-2 px-5 py-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg/70">Subtotal</dt>
              <dd>{formatMoney(order.subtotalCents, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg/70">Delivery</dt>
              <dd>
                {order.shippingCents === 0
                  ? "Free"
                  : formatMoney(order.shippingCents, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(order.totalCents, order.currency)}</dd>
            </div>
          </dl>
        </section>

        {/* ── Details ───────────────────────────────────────────────── */}
        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4 shrink-0 text-haze" />
              <h3 className="label-xs text-haze">Delivery address</h3>
            </div>
            <address className="mt-3 space-y-0.5 text-sm not-italic text-fg/75">
              <p className="font-semibold text-fg">{order.fullName}</p>
              <p>{order.addressLine1}</p>
              {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
              <p>
                {order.city} {order.postcode}
              </p>
              <p>{order.country}</p>
              {order.phone ? <p className="pt-1 text-fg/65">{order.phone}</p> : null}
            </address>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <BoxIcon className="h-4 w-4 shrink-0 text-haze" />
              <h3 className="label-xs text-haze">Payment</h3>
            </div>
            <p className="mt-3 text-sm font-semibold capitalize">
              {order.paymentMethod.replace(/_/g, " ")}
            </p>
            <p className="mt-1.5 text-xs text-fg/65">
              {order.status === "PENDING"
                ? "Not yet confirmed."
                : order.stripePaymentIntentId
                  ? "Payment confirmed."
                  : "Reference on file."}
            </p>
          </section>

          <section className="card p-5">
            <h3 className="label-xs text-haze">Need help?</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg/70">
              Quote order <span className="font-mono font-semibold">{order.orderNumber}</span> and we
              will pick it up from there.
            </p>
            <a
              href={`mailto:hello@rav3s.com?subject=Order ${order.orderNumber}`}
              className="btn btn-ghost mt-4 w-full"
            >
              Contact us
            </a>
            <Link href="/shop" className="btn btn-primary mt-2.5 w-full">
              Continue shopping
            </Link>
          </section>
        </aside>
      </div>
    </AccountShell>
  );
}