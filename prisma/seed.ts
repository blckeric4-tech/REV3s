import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SITE_SETTINGS_DEFAULTS } from "../src/lib/settings-defaults";
import { FRENCH_PRODUCTS, FRENCH_COLOURS, FRENCH_BADGES } from "../src/lib/i18n/french-content";

const db = new PrismaClient();

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const ONE_SIZE = ["One Size"];

const COLORS: Record<string, string> = {
  "Ink Black": "#16171A",
  Bone: "#EFEAE1",
  Volt: "#D7FF3E",
  Clay: "#FF5A36",
  "Haze Grey": "#8A8F98",
  "Deep Navy": "#1B2A4A",
};

type Seed = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  compareCents?: number;
  category: string;
  badge?: string;
  featured?: boolean;
  sizes: string[];
  colors: string[];
  stockSeed: number;
};

const CATALOG: Seed[] = [
  {
    slug: "core-heavyweight-tee",
    name: "Core Heavyweight Tee",
    tagline: "240gsm loopback cotton",
    description:
      "The tee we build everything else around. 240gsm loopback cotton, ribbed collar that holds its shape after fifty washes, and a boxy cut that sits just off the shoulder. Pre-shrunk and garment dyed, so it fades the way you want it to.",
    priceCents: 4200,
    category: "T-Shirts",
    badge: "Best seller",
    featured: true,
    sizes: SIZES,
    colors: ["Ink Black", "Bone", "Volt", "Clay", "Haze Grey"],
    stockSeed: 14,
  },
  {
    slug: "boxy-pocket-tee",
    name: "Boxy Pocket Tee",
    tagline: "Relaxed fit, reinforced pocket",
    description:
      "Wider through the body with a dropped shoulder and a chest pocket bar-tacked at both corners. Same 240gsm cotton as the Core, cut shorter and wider for people who like their tees to look borrowed.",
    priceCents: 4600,
    category: "T-Shirts",
    sizes: SIZES,
    colors: ["Ink Black", "Bone", "Haze Grey", "Deep Navy"],
    stockSeed: 9,
  },
  {
    slug: "rav3s-long-sleeve",
    name: "RAV3S Long Sleeve",
    tagline: "Heavy jersey, ribbed cuffs",
    description:
      "Heavyweight long sleeve with a ribbed neck, cuffs and hem that actually stay put. Cut long in the body so it layers cleanly under a jacket without riding up.",
    priceCents: 5800,
    category: "T-Shirts",
    badge: "New",
    featured: true,
    sizes: SIZES,
    colors: ["Ink Black", "Bone", "Clay"],
    stockSeed: 7,
  },
  {
    slug: "merino-crew-jumper",
    name: "Merino Crew Jumper",
    tagline: "Extra-fine merino, fully fashioned",
    description:
      "Knitted from extra-fine merino wool in a fully fashioned construction, which means the panels are shaped rather than cut from a flat sheet. Warm without weight, and it packs down to nothing.",
    priceCents: 12400,
    category: "Jumpers",
    featured: true,
    sizes: SIZES,
    colors: ["Haze Grey", "Ink Black", "Deep Navy", "Bone"],
    stockSeed: 6,
  },
  {
    slug: "cable-knit-jumper",
    name: "Cable Knit Jumper",
    tagline: "Hand-linked, 5-gauge",
    description:
      "The heaviest thing we make. A five-gauge cable with hand-linked seams and a deep ribbed hem, spun from lambswool for a handle that softens with every wear.",
    priceCents: 14800,
    category: "Jumpers",
    badge: "Limited",
    sizes: SIZES,
    colors: ["Bone", "Haze Grey", "Deep Navy"],
    stockSeed: 4,
  },
  {
    slug: "ribbed-crewneck",
    name: "Ribbed Crewneck",
    tagline: "Merino blend, 2x2 rib",
    description:
      "A fine 2x2 rib in a merino blend that layers under a coat without adding bulk. Clean crew neck, set-in sleeves, and a hem that stays put untucked.",
    priceCents: 9800,
    category: "Jumpers",
    sizes: SIZES,
    colors: ["Ink Black", "Bone", "Volt", "Deep Navy"],
    stockSeed: 11,
  },
  {
    slug: "heavy-fleece-hoodie",
    name: "Heavy Fleece Hoodie",
    tagline: "480gsm brushed fleece",
    description:
      "480gsm brushed-back fleece with a double-layer hood, heavy ribbed cuffs and a kangaroo pocket set at the right angle to actually reach. The one we wear most.",
    priceCents: 13200,
    category: "Hoodies",
    badge: "Best seller",
    featured: true,
    sizes: SIZES,
    colors: ["Ink Black", "Haze Grey", "Bone", "Clay"],
    stockSeed: 10,
  },
  {
    slug: "oversized-zip-hoodie",
    name: "Oversized Zip Hoodie",
    tagline: "Dropped shoulder, metal zip",
    description:
      "Deliberately oversized with a dropped shoulder and a heavy-duty YKK metal zip. Cut long in the sleeve so the cuffs land where you want them.",
    priceCents: 15600,
    category: "Hoodies",
    badge: "New",
    sizes: SIZES,
    colors: ["Ink Black", "Haze Grey", "Deep Navy"],
    stockSeed: 5,
  },
  {
    slug: "waxed-work-jacket",
    name: "Waxed Work Jacket",
    tagline: "Waxed cotton, four pockets",
    description:
      "Waxed cotton canvas that stiffens when cold and relaxes with wear. Four bellows pockets, a corduroy collar, and brass hardware that will outlive the jacket.",
    priceCents: 24000,
    category: "Outerwear",
    badge: "Limited",
    featured: true,
    sizes: SIZES,
    colors: ["Ink Black", "Clay", "Deep Navy"],
    stockSeed: 3,
  },
  {
    slug: "ribbed-beanie",
    name: "Ribbed Beanie",
    tagline: "Merino rib, folded cuff",
    description:
      "Chunky merino rib with a folded cuff that stays up. Knitted in a fine gauge so it packs into a pocket and comes back out without a crease.",
    priceCents: 2800,
    category: "Accessories",
    sizes: ONE_SIZE,
    colors: ["Ink Black", "Volt", "Clay", "Haze Grey", "Bone"],
    stockSeed: 22,
  },
];

function skuFor(slug: string, size: string, color: string) {
  const base = slug
    .split("-")
    .map((p) => p.slice(0, 3).toUpperCase())
    .join("");
  const c = color
    .split(" ")
    .map((p) => p[0].toUpperCase())
    .join("");
  return `RV3-${base}-${c}-${size.replace(/\s/g, "").toUpperCase()}`;
}

async function main() {
  // --- admin user ---
  const email = (process.env.ADMIN_EMAIL ?? "admin@rav3s.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "rav3s-admin";
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "RAV3S Owner",
      passwordHash: await bcrypt.hash(password, 12),
      role: "owner",
    },
  });
  console.log(`Admin user ready: ${email}`);

  // --- site settings singleton ---
  // The TEXT columns have no database default (MySQL/TiDB forbid it), so the
  // values come from here. Keep in sync with src/lib/settings-defaults.ts.
  await db.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", ...SITE_SETTINGS_DEFAULTS },
  });
  console.log("Site settings ready");

  // --- products ---
  let created = 0;
  for (const p of CATALOG) {
    const images = [1, 2, 3].map((i) => `/images/products/${p.slug}-${i}.svg`).join(",");
    const data = {
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      priceCents: p.priceCents,
      compareCents: p.compareCents ?? null,
      category: p.category,
      badge: p.badge ?? null,
      image: `/images/products/${p.slug}-1.svg`,
      images,
      featured: p.featured ?? false,
      active: true,
    };

    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await db.product.update({ where: { slug: p.slug }, data });
      continue;
    }

    // French goes in only on create. The update above is unconditional, so adding
    // the `*Fr` fields to `data` would overwrite whatever the shop owner has since
    // translated in the admin every time the seed is re-run. To fill French on an
    // existing database, run `npm run db:french:apply`, which only writes blanks.
    const french = FRENCH_PRODUCTS[p.slug];

    await db.product.create({
      data: {
        ...data,
        slug: p.slug,
        nameFr: french?.name ?? null,
        taglineFr: french?.tagline ?? null,
        descriptionFr: french?.description ?? null,
        badgeFr: french && p.badge ? (FRENCH_BADGES[p.badge] ?? french.badge) : null,
        variants: {
          create: p.colors.flatMap((color) =>
            p.sizes.map((size, i) => ({
              size,
              color,
              colorFr: FRENCH_COLOURS[color] ?? null,
              colorHex: COLORS[color],
              // deterministic pseudo-stock so restocks look natural
              stock: Math.max(0, p.stockSeed - ((i * 3 + p.colors.indexOf(color) * 2) % 7)),
              sku: skuFor(p.slug, size, color),
            }))
          ),
        },
      },
    });
    created++;
  }
  console.log(`Products ready: ${created} created, ${CATALOG.length} total`);

  const total = await db.product.count();
  const variants = await db.variant.count();
  console.log(`Database now holds ${total} products / ${variants} variants`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
