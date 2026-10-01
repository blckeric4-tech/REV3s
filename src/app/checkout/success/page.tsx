import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ClearCartOnSuccess } from "@/components/clear-cart";

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  const order = session_id
    ? await db.order.findFirst({
        where: {
          OR: [{ stripeSessionId: session_id }, { orderNumber: session_id }],
        },
        include: { items: true },
      })
    : null;

  return (
    <div className="container-rav3s flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <ClearCartOnSuccess />

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fg text-3xl">
        ✓
      </div>

      <h1 className="mt-8 text-4xl font-black uppercase md:text-5xl">Order confirmed</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-fg/65">
        Thanks for your order. We have sent a confirmation to your email and we will
        email you again the moment it ships.
      </p>

      {order ? (
        <div className="card mt-10 w-full max-w-lg p-6 text-left">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="label-xs text-fg/65">Order</p>
              <p className="mt-1 font-mono text-sm">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="label-xs text-fg/65">Total</p>
              <p className="mt-1 text-sm font-semibold">
                {formatMoney(order.totalCents, order.currency)}
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-fg/75">
                  {item.name}{" "}
                  <span className="text-fg/65">
                    &mdash; {item.color} / {item.size} &times; {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-semibold">
                  {formatMoney(item.unitPriceCents * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-4 text-sm">
            <p className="label-xs text-fg/65">Shipping to</p>
            <p className="mt-1.5 text-fg/75">{order.fullName}</p>
            <p className="text-fg/75">{order.addressLine1}</p>
            <p className="text-fg/75">
              {order.city} {order.postcode} {order.country}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-8 max-w-md text-sm text-fg/70">
          We are still confirming your payment. You will get an email with your order
          details within a minute &mdash; no need to place it again.
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">Keep shopping</Link>
        <Link href="/" className="btn btn-outline">Back home</Link>
      </div>
    </div>
  );
}
