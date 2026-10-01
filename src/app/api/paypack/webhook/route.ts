import { db } from "@/lib/prisma";
import { paypackVerifySignature } from "@/lib/payments";
import { fulfilOrder } from "@/lib/orders";

type PaypackWebhook = {
  event?: string;
  data?: {
    ref?: string;
    status?: string;
    amount?: number;
    number?: string;
  };
};

/**
 * Paypack IPN. The customer approving the prompt on their phone is what
 * confirms the order, so this is the authoritative callback — the polling
 * endpoint is only a faster path to the same result.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paypack-signature");

  if (!(await paypackVerifySignature(raw, signature))) {
    return new Response("Invalid signature.", { status: 401 });
  }

  let payload: PaypackWebhook;
  try {
    payload = JSON.parse(raw) as PaypackWebhook;
  } catch {
    return new Response("Bad payload.", { status: 400 });
  }

  const ref = payload?.data?.ref;
  if (!ref) return new Response("No reference.", { status: 400 });

  const order = await db.order.findFirst({
    where: { paymentRef: ref },
    select: { id: true, status: true },
  });
  if (!order) return new Response("ok", { status: 200 });

  const status = String(payload?.data?.status || "").toLowerCase();

  if (status === "successful") {
    await fulfilOrder(order.id);
  } else if (status === "failed" || status === "reversed") {
    await db.order
      .updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      })
      .catch(() => undefined);
  }

  return new Response("ok", { status: 200 });
}
