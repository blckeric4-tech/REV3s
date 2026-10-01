import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { getSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import {
  availableMethods,
  flutterwaveInitialize,
  paypackCashin,
  type PaymentMethod,
} from "@/lib/payments";

const bodySchema = z.object({
  method: z.enum(["paypack", "flutterwave", "stripe"]),
  phone: z.string().min(9, "Enter a valid phone number.").max(20).optional(),
  email: z.string().email("Enter a valid email.").optional(),
  fullName: z.string().min(2, "Enter your full name.").max(120).optional(),
  lines: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your bag is empty.")
    .max(50),
});

function orderNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `RV3-${stamp}${rand}`;
}

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (e) {
    const message =
      e instanceof z.ZodError
        ? (e.issues[0]?.message ?? "Invalid bag contents.")
        : "Invalid bag contents.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const method = parsed.method as PaymentMethod;
  if (!availableMethods().includes(method)) {
    return NextResponse.json(
      { error: "That payment method is not available yet. Please try another one." },
      { status: 503 }
    );
  }

  const settings = await getSettings();

  const variants = await db.variant.findMany({
    where: { id: { in: parsed.lines.map((l) => l.variantId) } },
    include: { product: { select: { slug: true, name: true, image: true, active: true } } },
  });

  const byId = new Map(variants.map((v) => [v.id, v]));

  const orderLines = [];
  for (const requested of parsed.lines) {
    const variant = byId.get(requested.variantId);
    if (!variant || !variant.product.active) {
      return NextResponse.json(
        { error: "An item in your bag is no longer available." },
        { status: 409 }
      );
    }
    if (variant.stock < requested.quantity) {
      return NextResponse.json(
        {
          error:
            variant.stock === 0
              ? `${variant.product.name} (${variant.color} / ${variant.size}) just sold out.`
              : `Only ${variant.stock} left of ${variant.product.name} (${variant.size}).`,
        },
        { status: 409 }
      );
    }
    orderLines.push({ variant, quantity: requested.quantity });
  }

  const products = await db.product.findMany({
    where: { id: { in: variants.map((v) => v.productId) } },
    select: { id: true, priceCents: true },
  });
  const priceByProduct = new Map(products.map((p) => [p.id, p.priceCents]));

  const totalSubtotal = orderLines.reduce(
    (sum, l) => (priceByProduct.get(l.variant.productId) ?? 0) * l.quantity,
    0
  );

  const shippingCents =
    settings.freeShippingOverCents > 0 && totalSubtotal >= settings.freeShippingOverCents
      ? 0
      : settings.shippingFlatCents;

  const totalCents = totalSubtotal + shippingCents;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const amountWhole = Math.max(1, Math.round(totalCents / 100));

  // A signed-in shopper owns the order: their verified email and account name
  // win over whatever the browser sent, otherwise the order would land in
  // someone else's account history and they would never see it.
  const customer = await getCustomer();
  const orderEmail = customer ? customer.email : parsed.email ?? "pending@checkout.local";
  const orderName = customer ? customer.name : parsed.fullName ?? "Pending checkout";

  const order = await db.order.create({
    data: {
      orderNumber: orderNumber(),
      email: orderEmail,
      fullName: orderName,
      phone: parsed.phone ?? null,
      customerId: customer?.id ?? null,
      addressLine1: "-",
      city: settings.mapAddress || "Kigali",
      postcode: "-",
      country: "RW",
      subtotalCents: totalSubtotal,
      shippingCents,
      totalCents,
      currency: settings.currency,
      status: "PENDING",
      paymentMethod: method,
      items: {
        create: orderLines.map(({ variant, quantity }) => ({
          productId: variant.productId,
          variantId: variant.id,
          name: variant.product.name,
          slug: variant.product.slug,
          size: variant.size,
          color: variant.color,
          image: variant.product.image,
          unitPriceCents: priceByProduct.get(variant.productId) ?? 0,
          quantity,
        })),
      },
    },
  });

  try {
    if (method === "paypack") {
      const result = await paypackCashin({
        amount: amountWhole,
        phone: parsed.phone!,
        idempotencyKey: order.id,
      });
      await db.order.update({
        where: { id: order.id },
        data: { paymentRef: String(result.ref) },
      });
      return NextResponse.json({
        method,
        ref: result.ref,
        orderNumber: order.orderNumber,
        pollUrl: `/api/paypack/status?ref=${result.ref}`,
        orderId: order.id,
      });
    }

    if (method === "flutterwave") {
      const link = await flutterwaveInitialize({
        txRef: order.orderNumber,
        amount: amountWhole,
        email: orderEmail,
        phone: parsed.phone,
        redirectUrl: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
      });
      await db.order.update({
        where: { id: order.id },
        data: { paymentRef: order.orderNumber },
      });
      return NextResponse.json({ method, url: link, orderId: order.id });
    }

    if (!stripeConfigured() || !stripe) throw new Error("Stripe is not configured.");

    const stripeCurrency = settings.currency === "rwf" ? "usd" : settings.currency;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: orderLines.map(({ variant, quantity }) => ({
        quantity,
        price_data: {
          currency: stripeCurrency,
          unit_amount: priceByProduct.get(variant.productId) ?? 0,
          product_data: {
            name: variant.product.name,
            description: `${variant.color} / ${variant.size}`,
            images: [`${siteUrl}${variant.product.image}`],
            metadata: { slug: variant.product.slug },
          },
        },
      })),
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "IE", "FR", "DE", "NL", "BE", "ES", "IT", "PT", "SE", "DK", "NO", "FI", "PL", "AU", "NZ", "ZA", "AE", "SA", "SG", "MY"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: stripeCurrency },
            display_name: shippingCents === 0 ? "Free delivery" : "Standard delivery",
            delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 6 } },
          },
        },
      ],
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
      cancel_url: `${siteUrl}/checkout/cancelled?order=${order.orderNumber}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ method, url: session.url, orderId: order.id });
  } catch (e) {
    await db.order
      .delete({ where: { id: order.id } })
      .catch(() => undefined);
    const message = e instanceof Error ? e.message : "The payment request failed.";
    return NextResponse.json({ error: `Payment error: ${message}` }, { status: 502 });
  }
}
