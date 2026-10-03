import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ClearCartOnSuccess } from "@/components/clear-cart";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("checkout.successMeta") };
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const { t, tag } = await getTranslator();

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

      <h1 className="mt-8 text-4xl font-black uppercase md:text-5xl">{t("checkout.successTitle")}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-fg/65">
        {t("checkout.successBody")}
      </p>

      {order ? (
        <div className="card mt-10 w-full max-w-lg p-6 text-left">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="label-xs text-fg/65">{t("checkout.order")}</p>
              <p className="mt-1 font-mono text-sm">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="label-xs text-fg/65">{t("cart.total")}</p>
              <p className="mt-1 text-sm font-semibold">
                {formatMoney(order.totalCents, order.currency, tag)}
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
                  {formatMoney(item.unitPriceCents * item.quantity, order.currency, tag)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-4 text-sm">
            <p className="label-xs text-fg/65">{t("checkout.shippingTo")}</p>
            <p className="mt-1.5 text-fg/75">{order.fullName}</p>
            <p className="text-fg/75">{order.addressLine1}</p>
            <p className="text-fg/75">
              {order.city} {order.postcode} {order.country}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-8 max-w-md text-sm text-fg/70">{t("checkout.confirming")}</p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">{t("checkout.keepShopping")}</Link>
        <Link href="/" className="btn btn-outline">{t("checkout.backHome")}</Link>
      </div>
    </div>
  );
}
