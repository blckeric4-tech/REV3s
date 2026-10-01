# RAV3S

A complete clothing e-commerce site: landing page, storefront, cart, Stripe payments and
a full admin dashboard that controls every part of the site from one screen.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma + SQLite + Stripe**.

---

## Quick start

```bash
npm install
npm run setup     # generates the Prisma client, creates the DB, seeds 10 products
npm run dev       # http://localhost:3000
```

**Admin login:** <http://localhost:3000/admin>

| | |
|---|---|
| Email | `admin@rav3s.com` |
| Password | `rav3s-admin` |

Change this immediately in **Admin → Site editor → Change admin password** (also editable
via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before the first seed).

---

## Connecting real payments

Checkout is fully wired but ships with placeholder keys, so the site is browsable and
testable before you have a Stripe account.

**1. Get your keys** from <https://dashboard.stripe.com/test/apikeys> and put them in `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

The dashboard shows a warning banner on the Overview page until `STRIPE_SECRET_KEY` is a
real key.

**2. Forward webhooks to your machine.** The webhook is what marks an order as paid and
decrements stock, so it must be running for orders to complete:

```bash
# install once
npm install -g stripe

# in a second terminal
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` it prints into `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Restart the dev server.

**3. Test a payment** with card `4242 4242 4242 4242`, any future expiry, any CVC.

When you go live, set the live keys, switch `stripe listen` for a real webhook endpoint in
the Stripe dashboard (`https://yourdomain.com/api/stripe/webhook`), and set:

```env
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

---

## The admin dashboard

Everything is editable at `/admin` — no code changes needed for day-to-day changes.

| Page | What it controls |
|---|---|
| **Overview** | Revenue, order counts, recent orders, low-stock warnings |
| **Products** | Create/edit/delete products, pricing, badges, visibility, per-variant stock |
| **Orders** | Filter by status, update fulfilment state, see full customer + payment detail |
| **Site editor** | Brand name, **all colours**, announcement bar, hero, brand story, value props, categories, shop page, newsletter, footer, shipping rules |

**Colours** are the highlight: the five brand swatches are injected as CSS variables on
`<html>`, so changing Volt or Clay in the admin restyles every button, badge and highlight
across the whole site instantly.

Content lives in a single `SiteSettings` row, so the admin really is one centralised place.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:studio` | Browse the database in a GUI |
| `npm run db:seed` | Re-seed products and the admin user |
| `npm run db:reset` | Wipe and rebuild the database (**deletes all orders**) |
| `node scripts/generate-images.mjs` | Regenerate the product artwork |

---

## Project layout

```
prisma/
  schema.prisma        Products, variants, orders, settings
  seed.ts              10 products / 203 variants + admin user
src/
  app/
    page.tsx           Landing page
    shop/              Catalogue with category, sort and search filters
    product/[slug]/    Product detail + variant picker
    cart/              Bag and totals
    checkout/          Stripe success and cancel pages
    api/checkout/      Creates the Stripe session (validates stock server-side)
    api/stripe/webhook/  Marks orders paid, decrements stock
    admin/             Dashboard, products, orders, site editor
  components/          UI, cart store, admin forms
  lib/                 Prisma, Stripe, auth, settings, money helpers
proxy.ts               Route guard for /admin
```

## Notes

- **Security.** Prices and stock are always re-read from the database at checkout; the
  client is never trusted. Admin session cookies are httpOnly, signed with HMAC and
  expire after 7 days. Every admin page *and* every server action re-checks the session —
  `proxy.ts` is only the first line of defence.
- **Payments are idempotent.** Stripe retries webhooks, so the order is claimed with a
  conditional update inside a transaction. Stock is only ever decremented once per order.
- **SQLite** is perfect locally. To move to Postgres later, change the `provider` in
  `prisma/schema.prisma`, point `DATABASE_URL` at your host, and re-run `npm run db:push`.
- **`.npmrc` sets `legacy-peer-deps=true`** to work around an npm 11 crash resolving
  Prisma's peer-dependency graph, and relocates the npm cache to `D:` so your C: drive
  does not fill up.
