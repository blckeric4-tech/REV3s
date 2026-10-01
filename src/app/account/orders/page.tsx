import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { requireCustomer } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { AccountEmpty, AccountShell } from "../account-shell";

export const metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const customer = await requireCustomer("/account/orders");

  const [account, orders] = await Promise.all([
    db.customer.findUniqueOrThrow({
      where: { id: customer.id },
      select: { createdAt: true },
    }),
    db.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        status: true,
        subtotalCents: true,
        shippingCents: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        items: { select: { image: true, name: true, slug: true, quantity: true, size: true, color: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return (
    <AccountShell customer={customer} memberSince={account.createdAt} active="orders">
      {orders.length === 0 ? (
        <AccountEmpty
          title="No orders yet"
          body="Your order history will appear here — every order, its status and its receipt, for as long as the account exists."
          action={{ href: "/shop", label: "Browse the range" }}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <article className="card overflow-hidden transition-colors hover:border-fg">
                {/* Header: identity + money, so scanning the list is instant. */}
                <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="font-mono text-sm font-bold hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs text-fg/65">
                      Placed{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="status-pill" data-status={order.status}>
                      {order.status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatMoney(order.totalCents, order.currency)}
                      </p>
                      <p className="mt-0.5 text-xs text-fg/65">
                        {order._count.items} {order._count.items === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </header>

                {/* What was actually bought. */}
                <ul className="divide-y divide-line">
                  {order.items.map((item, i) => (
                    <li
                      key={`${item.name}-${item.size}-${item.color}-${i}`}
                      className="flex items-center gap-4 px-5 py-3.5"
                    >
                      <span className="media-mat relative h-16 w-14 shrink-0 overflow-hidden rounded-md border border-line">
                        <Image src={item.image} alt={item.name} fill sizes="3.5rem" className="media-fit" />
                      </span>
                      <span className="min-w-0 flex-1">
                        {/* Archived orders keep their own copy of the name and
                            image, so the row must not depend on the product still
                            existing — hence no link, just the recorded details. */}
                        <span className="block text-sm font-semibold">{item.name}</span>
                        <span className="mt-1 block text-xs text-fg/65">
                          {item.color} / {item.size} &times; {item.quantity}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-5 py-3.5">
                  <p className="text-xs text-fg/65">
                    {order.shippingCents === 0
                      ? "Free delivery"
                      : `Delivery ${formatMoney(order.shippingCents, order.currency)}`}
                  </p>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="label-xs text-fg underline-offset-4 hover:underline"
                  >
                    View details
                  </Link>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}