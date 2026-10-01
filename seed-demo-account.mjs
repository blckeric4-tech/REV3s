/**
 * Creates ONE demo customer with orders in every status, purely so the account
 * pages can be reviewed with realistic content.
 *
 *   node seed-demo-account.mjs
 *
 * Safe to run repeatedly — it removes and recreates the demo account each time.
 * To delete it later:
 *   node -e "..." or just use the "Remove demo data" note in HANDOFF.md
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const EMAIL = "demo@rav3s.test";
const PASSWORD = "demo1234";

const variants = await db.variant.findMany({
  take: 6,
  include: { product: { select: { id: true, name: true, slug: true, image: true, priceCents: true } } },
});
if (variants.length === 0) {
  console.log("No variants in the database — seed products first.");
  process.exit(1);
}

await db.customer.deleteMany({ where: { email: EMAIL } });

const customer = await db.customer.create({
  data: {
    email: EMAIL,
    name: "Aline Umutoni",
    passwordHash: await bcrypt.hash(PASSWORD, 12),
  },
});

// Deliberately one of each status so every status pill and timeline step shows.
const PLAN = [
  { status: "DELIVERED", items: 2, days: 41 },
  { status: "SHIPPED", items: 1, days: 12 },
  { status: "PAID", items: 3, days: 4 },
  { status: "PENDING", items: 1, days: 0 },
];

let n = 0;
for (const step of PLAN) {
  n += 1;
  const picked = variants.slice(0, step.items);
  const subtotal = picked.reduce((s, v) => s + v.product.priceCents, 0);
  const shipping = subtotal >= 5000000 ? 0 : 300000;
  const createdAt = new Date(Date.now() - step.days * 86400000);

  await db.order.create({
    data: {
      orderNumber: `RV3-DEMO${String(n).padStart(2, "0")}`,
      email: EMAIL,
      fullName: "Aline Umutoni",
      phone: "+250 788 123 456",
      customerId: customer.id,
      addressLine1: "KN 5 Rd, Plot 12",
      addressLine2: "Blue Corner House",
      city: "Kigali",
      postcode: "00100",
      country: "RW",
      subtotalCents: subtotal,
      shippingCents: shipping,
      totalCents: subtotal + shipping,
      currency: "rwf",
      status: step.status,
      paymentMethod: "paypack",
      stripePaymentIntentId: step.status === "PENDING" ? null : `pi_demo_${customer.id}_${n}`,
      createdAt,
      items: {
        create: picked.map((v) => ({
          productId: v.product.id,
          variantId: v.id,
          name: v.product.name,
          slug: v.product.slug,
          size: v.size,
          color: v.color,
          image: v.product.image,
          unitPriceCents: v.product.priceCents,
          quantity: 1,
        })),
      },
    },
  });
}

console.log(`Demo account ready.
  email:    ${EMAIL}
  password: ${PASSWORD}
  orders:   ${PLAN.length} (one per status)`);

await db.$disconnect();