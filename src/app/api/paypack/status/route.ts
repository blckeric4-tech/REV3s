import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { paypackFind, paypackIsPaid } from "@/lib/payments";
import { fulfilOrder } from "@/lib/orders";

/**
 * Polled by the checkout page after a Paypack prompt is sent.
 * Returns the order's current status and confirms it the moment Paypack reports
 * the transaction as successful — so mobile-money customers don't wait on a webhook.
 */
export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref." }, { status: 400 });

  const order = await db.order.findFirst({
    where: { paymentRef: ref },
    select: { id: true, status: true, orderNumber: true },
  });
  if (!order) {
    return NextResponse.json({ error: "No order matches that reference." }, { status: 404 });
  }

  if (order.status === "PAID" || order.status === "SHIPPED") {
    return NextResponse.json({ status: "PAID", orderNumber: order.orderNumber });
  }

  let transaction: { status?: string };
  try {
    transaction = await paypackFind(ref);
  } catch (e) {
    const message = e instanceof Error ? e.message : "could not reach Paypack";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (paypackIsPaid(transaction)) {
    await fulfilOrder(order.id);
    return NextResponse.json({ status: "PAID", orderNumber: order.orderNumber });
  }

  return NextResponse.json({
    status: String(transaction.status || "pending").toUpperCase(),
    orderNumber: order.orderNumber,
  });
}
