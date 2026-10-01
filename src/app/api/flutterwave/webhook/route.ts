import { db } from "@/lib/prisma";
import { flutterwaveVerifyWebhook } from "@/lib/payments";
import { fulfilOrder } from "@/lib/orders";

type FlutterwaveWebhook = {
  event?: string;
  data?: {
    id?: number | string;
    tx_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
    customer?: { name?: string; email?: string; phone_number?: string };
    order_id?: number;
  };
};

/**
 * Flutterwave IPN. Covers cards and mobile money paid through Flutterwave.
 * The customer is redirected back to /checkout/success as well, which verifies
 * the transaction server-side — this is the reliable path for async payments.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const hash = request.headers.get("verif-hash");

  if (!(await flutterwaveVerifyWebhook(hash, raw))) {
    return new Response("Invalid hash.", { status: 401 });
  }

  let payload: FlutterwaveWebhook;
  try {
    payload = JSON.parse(raw) as FlutterwaveWebhook;
  } catch {
    return new Response("Bad payload.", { status: 400 });
  }

  const txRef = payload?.data?.tx_ref;
  if (!txRef) return new Response("No tx_ref.", { status: 400 });

  const order = await db.order.findFirst({
    where: { OR: [{ paymentRef: txRef }, { orderNumber: txRef }] },
    select: { id: true },
  });
  if (!order) return new Response("ok", { status: 200 });

  const status = String(payload?.data?.status || "").toLowerCase();

  if (status === "successful" || status === "completed") {
    await fulfilOrder(order.id, {
      email: payload?.data?.customer?.email ?? null,
      fullName: payload?.data?.customer?.name ?? null,
      phone: payload?.data?.customer?.phone_number ?? null,
    });
  } else if (status === "failed" || status === "cancelled") {
    await db.order
      .updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      })
      .catch(() => undefined);
  }

  return new Response("ok", { status: 200 });
}
