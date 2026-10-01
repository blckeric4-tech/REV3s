import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

export type FulfilOverrides = {
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  notes?: string | null;
  stripePaymentIntentId?: string | null;
};

/**
 * Turns a pending order into a confirmed one and takes stock.
 *
 * Idempotent by design: every gateway retries webhooks, so the order is claimed
 * atomically with a conditional update and stock is only decremented by the
 * call that actually won the claim.
 */
export async function fulfilOrder(orderId: string, overrides: FulfilOverrides = {}) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return false;
  if (order.status === "PAID" || order.status === "SHIPPED") return false;

  await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "EXPIRED"] } },
      data: {
        status: "PAID",
        email: overrides.email ?? order.email,
        fullName: overrides.fullName ?? order.fullName,
        phone: overrides.phone ?? order.phone,
        addressLine1:
          [overrides.addressLine1, overrides.addressLine2].filter(Boolean).join(", ") ||
          order.addressLine1,
        city: overrides.city ?? order.city,
        postcode: overrides.postcode ?? order.postcode,
        country: overrides.country ?? order.country,
        notes: overrides.notes ?? order.notes,
        stripePaymentIntentId: overrides.stripePaymentIntentId ?? order.stripePaymentIntentId,
      },
    });

    if (claimed.count === 0) return;

    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/shop");
  return true;
}

/** Marks an abandoned checkout as expired without leaving a ghost order. */
export async function expireOrder(orderId: string) {
  await db.order
    .updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "EXPIRED" },
    })
    .catch(() => undefined);
  revalidatePath("/admin/orders");
}

export async function refundByPaymentIntent(paymentIntentId: string) {
  await db.order
    .updateMany({
      where: { stripePaymentIntentId: paymentIntentId, status: { in: ["PAID", "SHIPPED"] } },
      data: { status: "REFUNDED" },
    })
    .catch(() => undefined);
  revalidatePath("/admin/orders");
}
