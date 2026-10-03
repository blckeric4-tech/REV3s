/**
 * Default values for the `SiteSettings` singleton row.
 *
 * These live in TypeScript rather than in `prisma/schema.prisma` because MySQL
 * and TiDB reject a column DEFAULT on any BLOB/TEXT column:
 *
 *     Error: BLOB/TEXT/JSON column 'whatsappMessage' can't have a default value
 *
 * `SiteSettings` is almost entirely prose, and prose needs TEXT — VARCHAR(191)
 * would truncate it and a row of VARCHAR(4000)s would blow past InnoDB's 65535
 * byte row limit. So the columns stay TEXT, the schema declares no default, and
 * every code path that creates the row supplies these values instead.
 *
 * There are exactly three places that write this row, and all three must pass
 * these defaults when creating:
 *   - `getSettings()`            src/lib/settings.ts
 *   - `prisma/seed.ts`
 *   - the admin settings action  src/app/admin/actions.ts (already passes a full
 *                                field set, so it does not need them)
 *
 * Adding a new TEXT column means adding it here too, or the row cannot be
 * created. `db push` will not tell you — the failure only shows up at runtime.
 */

/** Only the TEXT columns, which are exactly the ones the database cannot default. */
export const SITE_SETTINGS_DEFAULTS = {
  // international contact
  mapEmbedUrl: "",
  tiktokUrl: "https://tiktok.com/@rav3s",
  facebookUrl: "",
  instagramUrl: "https://instagram.com/rav3s",
  whatsappMessage: "Hi RAV3S! I would like to order clothes.",

  // media
  heroVideo: "",
  galleryImages: "[]",
  videoPoster: "/images/hero.svg",

  // hero
  heroKicker: "Drop 04 — Autumn/Winter",
  heroTitle: "BUILT FOR THE LONG WAY ROUND",
  heroBody:
    "Heavyweight tees and knitwear cut from fabric that gets better with every wash.",
  heroCtaText: "ORDER ONLINE",
  heroCtaHref: "/shop",
  heroSecondaryText: "New arrivals",
  heroSecondaryHref: "/shop?sort=newest",
  heroImage: "/images/hero.svg",

  // story / about
  storyKicker: "The label",
  storyTitle: "We make fewer things, better.",
  storyBody:
    "RAV3S started in a single room with one screen printer and a stubborn idea: everyday clothes should be built to outlast the trend that sold them to you.",
  storyImage: "/images/story.svg",

  // value props
  valueProps:
    '["240gsm heavyweight cotton","Small-batch production","Free delivery over 50,000 FRW","Pay with MTN, Airtel or card"]',

  // shop page
  shopTitle: "The Full Range",
  shopDescription: "Every piece we make, in every colour and size.",

  // categories
  categories: '["T-Shirts","Jumpers","Hoodies","Outerwear","Accessories"]',

  // newsletter
  newsletterTitle: "Get first access to every drop",
  newsletterBody: "Sign up for early links, restocks and nothing else.",

  // footer
  footerAbout:
    "RAV3S is an independent label making heavyweight essentials in small runs.",
  footerInstagram: "https://instagram.com/rav3s",
  footerTiktok: "https://tiktok.com/@rav3s",

  // ── French template copy ──
  // These ship with the template so a fresh database renders in French without
  // the admin having to type anything. They are only the *defaults* for a new
  // row; once the admin saves, their text wins. `scripts/backfill-french.mjs`
  // applies them to an existing row, and only ever fills columns that are
  // still NULL, so it can never overwrite a translation already written.
  //
  // Keep `categoriesFr` and `valuePropsFr` in the same order as the English
  // lists above — the storefront pairs them by index.
  taglineFr: "L'essentiel, bien conçu.",
  announcementTextFr: "Livraison offerte dès 50 000 FRW",
  whatsappMessageFr: "Bonjour RAV3S ! Je souhaite commander des vêtements.",
  heroKickerFr: "Drop 04 — Automne/Hiver",
  heroTitleFr: "CONÇU POUR DURER",
  heroBodyFr:
    "T-shirts lourds et tricots coupés dans un tissu qui s'améliore à chaque lavage.",
  heroCtaTextFr: "COMMANDER EN LIGNE",
  heroSecondaryTextFr: "Nouveautés",
  storyKickerFr: "La marque",
  storyTitleFr: "Nous faisons moins de choses, mais mieux.",
  storyBodyFr:
    "RAV3S a commencé dans une seule pièce, avec une presse à sérigraphie et une idée têtue : les vêtements du quotidien doivent être conçus pour durer plus longtemps que la tendance qui vous les a vendus.",
  valuePropsFr:
    '["Coton lourd 240 g/m²","Production en petites séries","Livraison offerte dès 50 000 FRW","Paiement par MTN, Airtel ou carte"]',
  shopTitleFr: "Toute la collection",
  shopDescriptionFr: "Chaque pièce que nous fabriquons, dans chaque couleur et chaque taille.",
  categoriesFr: '["T-shirts","Pulls","Sweats à capuche","Vestes","Accessoires"]',
  newsletterTitleFr: "Soyez les premiers informés de chaque drop",
  newsletterBodyFr: "Inscrivez-vous pour les liens en avant-première et les réassorts, rien d'autre.",
  footerAboutFr:
    "RAV3S est une marque indépendante qui produit des essentiels lourds en petites séries.",
} as const;
