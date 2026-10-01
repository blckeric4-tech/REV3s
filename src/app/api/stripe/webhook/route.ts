import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { expireOrder, fulfilOrder, refundByPaymentIntent } from "@/lib/orders";

/**
 * Turns a paid Stripe Checkout session into a confirmed order and decrements
 * stock. Safe to call twice — Stripe retries webhooks, so fulfilment itself is
 * idempotent (see lib/orders.ts).
 */
async function handleSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const shippingDetails = session.collected_information?.shipping_details ?? null;
  const address: Stripe.Address | null =
    shippingDetails?.address ??
    (session.customer_details?.address as Stripe.Address | null | undefined) ??
    null;
  const details = session.customer_details;

  await fulfilOrder(orderId, {
    email: details?.email,
    fullName: shippingDetails?.name ?? details?.name,
    phone: details?.phone,
    addressLine1: address?.line1,
    addressLine2: address?.line2,
    city: address?.city,
    postcode: address?.postal_code,
    country: address?.country,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Stripe is not configured.", { status: 503 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") await handleSession(session);
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        await handleSession(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "checkout.session.expired": {
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) await expireOrder(orderId);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (typeof charge.payment_intent === "string") {
          await refundByPaymentIntent(charge.payment_intent);
          revalidatePath("/admin/orders");
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "handler failed";
    return new Response(`Webhook handler error: ${message}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
