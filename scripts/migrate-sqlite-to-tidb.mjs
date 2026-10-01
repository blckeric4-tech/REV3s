/**
 * One-time data migration: local SQLite (prisma/dev.db) -> TiDB.
 *
 * Schema is handled separately by `prisma db push`. This moves the *rows*:
 * the 10 products, their 203 variants, site settings, the admin user, the demo
 * customer and the demo orders.
 *
 * Run it once, after pointing DATABASE_URL at the TiDB cluster:
 *     node scripts/migrate-sqlite-to-tidb.mjs
 *
 * Preview without writing anything:
 *     DRY_RUN=1 node scripts/migrate-sqlite-to-tidb.mjs
 *
 * Safe to re-run — everything is an upsert keyed on the primary key, so a second
 * run updates in place instead of duplicating.
 *
 * Two things this has to get right:
 *
 *  1. Datetimes. Prisma stores DateTime in SQLite as an INTEGER of epoch
 *     milliseconds. TiDB's DATETIME columns want a real date, so every value is
 *     passed through `new Date(ms)`. Skipping this sends `1790732231325` to MySQL
 *     as an invalid date.
 *  2. Booleans. SQLite has no boolean type; it stores 0 and 1. MySQL accepts
 *     those as tinyint, but we normalise to real booleans so nothing downstream
 *     has to wonder whether `featured === 1` or `featured === true`.
 */
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const DRY_RUN = process.env.DRY_RUN === "1";

const here = path.dirname(fileURLToPath(import.meta.url));
const SQLITE_PATH = path.join(here, "..", "prisma", "dev.db");

const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });
const db = new PrismaClient();

/** SQLite epoch-millis integer -> Date, leaving nulls alone. */
const toDate = (v) => (v === null || v === undefined ? null : new Date(Number(v)));
/** SQLite 0/1 -> real boolean. */
const toBool = (v) => v === 1 || v === true;
/** SQLite null/undefined -> undefined, so Prisma leaves the column at its default. */
const orUndef = (v) => (v === null || v === undefined ? undefined : v);

const all = (table) => sqlite.prepare(`SELECT * FROM "${table}"`).all();

/** Runs a write unless we are previewing. */
async function save(op) {
  if (DRY_RUN) return;
  await op();
}

const counts = {};

async function migrateProducts() {
  const rows = all("Product");
  for (const p of rows) {
    await save(() =>
      db.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: orUndef(p.tagline),
          description: p.description,
          priceCents: p.priceCents,
          compareCents: orUndef(p.compareCents),
          category: p.category,
          badge: orUndef(p.badge),
          image: p.image,
          images: orUndef(p.images),
          onBodyImages: orUndef(p.onBodyImages),
          featured: toBool(p.featured),
          active: toBool(p.active),
          createdAt: toDate(p.createdAt),
          updatedAt: toDate(p.updatedAt),
        },
      })
    );
  }
  counts.products = rows.length;
}

async function migrateVariants() {
  const rows = all("Variant");
  for (const v of rows) {
    await save(() =>
      db.variant.upsert({
        where: { id: v.id },
        update: {},
        create: {
          id: v.id,
          productId: v.productId,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
          sku: v.sku,
        },
      })
    );
  }
  counts.variants = rows.length;
}

async function migrateAdmins() {
  // Password hashes are bcrypt strings and transfer verbatim, so the existing
  // admin password keeps working after the move.
  const rows = all("AdminUser");
  for (const a of rows) {
    await save(() =>
      db.adminUser.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          email: a.email,
          name: a.name,
          passwordHash: a.passwordHash,
          role: a.role,
          createdAt: toDate(a.createdAt),
          updatedAt: toDate(a.updatedAt),
        },
      })
    );
  }
  counts.adminUsers = rows.length;
}

async function migrateCustomers() {
  const rows = all("Customer");
  for (const c of rows) {
    await save(() =>
      db.customer.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          email: c.email,
          name: c.name,
          passwordHash: c.passwordHash,
          avatarUrl: orUndef(c.avatarUrl),
          createdAt: toDate(c.createdAt),
          updatedAt: toDate(c.updatedAt),
        },
      })
    );
  }
  counts.customers = rows.length;
}

async function migrateOrders() {
  const rows = all("Order");
  for (const o of rows) {
    await save(() =>
      db.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          orderNumber: o.orderNumber,
          email: o.email,
          fullName: o.fullName,
          phone: orUndef(o.phone),
          customerId: orUndef(o.customerId),
          addressLine1: o.addressLine1,
          addressLine2: orUndef(o.addressLine2),
          city: o.city,
          postcode: o.postcode,
          country: o.country,
          subtotalCents: o.subtotalCents,
          shippingCents: o.shippingCents,
          totalCents: o.totalCents,
          currency: o.currency,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentRef: orUndef(o.paymentRef),
          stripeSessionId: orUndef(o.stripeSessionId),
          stripePaymentIntentId: orUndef(o.stripePaymentIntentId),
          notes: orUndef(o.notes),
          createdAt: toDate(o.createdAt),
          updatedAt: toDate(o.updatedAt),
        },
      })
    );
  }
  counts.orders = rows.length;
}

async function migrateOrderItems() {
  const rows = all("OrderItem");
  for (const i of rows) {
    await save(() =>
      db.orderItem.upsert({
        where: { id: i.id },
        update: {},
        create: {
          id: i.id,
          orderId: i.orderId,
          productId: orUndef(i.productId),
          variantId: orUndef(i.variantId),
          name: i.name,
          slug: i.slug,
          size: i.size,
          color: i.color,
          image: i.image,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
        },
      })
    );
  }
  counts.orderItems = rows.length;
}

/** SiteSettings has exactly three booleans; everything else is string or int. */
const SETTINGS_BOOLEANS = /^(announcementOn|whatsappOn|newsletterEnabled)$/;

async function migrateSettings() {
  const s = all("SiteSettings")[0];
  if (!s) {
    counts.siteSettings = 0;
    return;
  }
  const data = {};
  for (const [k, v] of Object.entries(s)) {
    // `id` is the upsert key; `updatedAt` is @updatedAt so Prisma sets it.
    if (k === "id" || k === "updatedAt") continue;
    data[k] = SETTINGS_BOOLEANS.test(k) ? toBool(v) : v;
  }
  await save(() => db.siteSettings.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, ...data } }));
  counts.siteSettings = 1;
}

async function migrateNewsletter() {
  const rows = all("NewsletterSubscriber");
  for (const n of rows) {
    await save(() =>
      db.newsletterSubscriber.upsert({
        where: { id: n.id },
        update: {},
        create: { id: n.id, email: n.email, createdAt: toDate(n.createdAt) },
      })
    );
  }
  counts.newsletterSubscribers = rows.length;
}

async function main() {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL still points at SQLite. Set it to the TiDB connection string first."
    );
  }

  // Products and their variants first: orders reference variants, and the
  // foreign keys reject children that arrive before their parents.
  await migrateProducts();
  await migrateVariants();
  await migrateAdmins();
  await migrateCustomers();
  await migrateOrders();
  await migrateOrderItems();
  await migrateSettings();
  await migrateNewsletter();

  for (const [k, v] of Object.entries(counts)) {
    console.log(`${DRY_RUN ? "would migrate" : "migrated"}: ${String(v).padStart(6)}  ${k}`);
  }

  if (DRY_RUN) {
    console.log("\nDRY RUN — nothing was written. Re-run without DRY_RUN to commit.");
    return;
  }

  const [pc, vc, oc, cc] = await Promise.all([
    db.product.count(),
    db.variant.count(),
    db.order.count(),
    db.customer.count(),
  ]);
  console.log(`\nTiDB now holds: ${pc} products, ${vc} variants, ${oc} orders, ${cc} customers`);
}

main()
  .catch((e) => {
    console.error("\nMigration failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());