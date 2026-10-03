/**
 * Fill the empty French columns of an existing database from the template
 * defaults in `src/lib/settings-defaults.ts`.
 *
 * Why this exists
 * ---------------
 * The `*Fr` columns on `SiteSettings` were added as nullable columns with no
 * default, because `prisma db push` can only add a column to a live TiDB table
 * safely that way. The consequence is that the existing row comes out of the
 * migration with NULL in all of them, and the storefront falls back to English.
 * `getSettings()` applies `SITE_SETTINGS_DEFAULTS` only when it has to *create*
 * the row, so an already populated database never sees them.
 *
 * This closes that gap without touching anything the shop owner has already
 * written: it assigns only to columns that are currently NULL or blank. Running
 * it twice is a no-op, and running it after the admin has been translating for a
 * week will not undo their work.
 *
 * It covers three groups: the SiteSettings prose, and the seed catalogue in
 * `src/lib/i18n/french-content.ts` (product copy, variant colours, product
 * badges). Products the shop owner added themselves are never touched — those
 * are translated on their own product page in the admin.
 *
 *     npm run db:french          # report what it would change
 *     npm run db:french:apply    # actually write
 *
 * The two are separate scripts on purpose. Passing `--apply` through as
 * `npm run db:french -- --apply` looks right but this npm build drops trailing
 * arguments before they reach the process, so the run silently stays a dry run.
 */
import { PrismaClient } from "@prisma/client";
import { SITE_SETTINGS_DEFAULTS } from "../src/lib/settings-defaults";
import { FRENCH_PRODUCTS, FRENCH_COLOURS, FRENCH_BADGES } from "../src/lib/i18n/french-content";

const APPLY = process.argv.includes("--apply") || process.argv.includes("--write");

/** Every French column on SiteSettings, i.e. the `*Fr` entries of the defaults. */
const FRENCH_FIELDS = Object.keys(SITE_SETTINGS_DEFAULTS).filter((key) =>
  key.endsWith("Fr"),
) as (keyof typeof SITE_SETTINGS_DEFAULTS & `...${string}`)[];

const db = new PrismaClient();

/** Blank means "nothing translated yet", which is the only thing we overwrite. */
const isBlank = (value: string | null | undefined) =>
  value === null || value === undefined || String(value).trim() === "";

type Plan = { label: string; column: string; from: string; to: string }[];

/**
 * Work out which French columns are still blank. Returns the changes without
 * touching the database, so the dry run and the real run share one code path.
 */
async function plan(): Promise<Plan> {
  const changes: Plan = [];

  const settings = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (settings) {
    for (const field of FRENCH_FIELDS) {
      if (isBlank(settings[field])) {
        changes.push({
          label: "settings",
          column: field,
          from: "",
          to: String(SITE_SETTINGS_DEFAULTS[field]),
        });
      }
    }
  }

  const products = await db.product.findMany({
    include: { variants: { select: { color: true, colorFr: true } } },
  });

  for (const product of products) {
    const french = FRENCH_PRODUCTS[product.slug];
    if (!french) continue;

    if (isBlank(product.nameFr)) {
      changes.push({ label: product.slug, column: "nameFr", from: product.name, to: french.name });
    }
    if (isBlank(product.taglineFr) && !isBlank(product.tagline)) {
      changes.push({
        label: product.slug,
        column: "taglineFr",
        from: String(product.tagline),
        to: french.tagline,
      });
    }
    if (isBlank(product.descriptionFr)) {
      changes.push({
        label: product.slug,
        column: "descriptionFr",
        from: "",
        to: french.description,
      });
    }
    if (isBlank(product.badgeFr) && !isBlank(product.badge)) {
      const translated = FRENCH_BADGES[String(product.badge)] ?? french.badge;
      if (translated) {
        changes.push({
          label: product.slug,
          column: "badgeFr",
          from: String(product.badge),
          to: translated,
        });
      }
    }

    // The same colour repeats across every size, so report it once.
    const seenColours = new Set<string>();
    for (const variant of product.variants) {
      if (seenColours.has(variant.color) || !isBlank(variant.colorFr)) continue;
      seenColours.add(variant.color);
      const translated = FRENCH_COLOURS[variant.color];
      if (translated) {
        changes.push({
          label: product.slug,
          column: "colorFr",
          from: variant.color,
          to: translated,
        });
      }
    }
  }

  return changes;
}

async function main() {
  const changes = await plan();

  if (!changes.length) {
    console.log("Nothing to backfill — every French column already has copy.");
    return;
  }

  const byLabel = new Map<string, Plan>();
  for (const change of changes) {
    if (!byLabel.has(change.label)) byLabel.set(change.label, []);
    byLabel.get(change.label)!.push(change);
  }

  console.log(
    `${APPLY ? "Applying" : "Dry run:"} French template copy — ${changes.length} column(s) across ${byLabel.size} row(s).\n`,
  );
  for (const [label, rows] of byLabel) {
    console.log(`  ${label}`);
    for (const row of rows) {
      console.log(`    ${row.column}: ${row.from || "(empty)"} → ${row.to.slice(0, 64)}`);
    }
  }

  if (!APPLY) {
    console.log("\nRe-run with --apply to write these.");
    return;
  }

  // Group per product so each row is one update rather than one per column.
  const productSlugs = new Set(
    changes.filter((c) => c.label !== "settings").map((c) => c.label),
  );
  for (const slug of productSlugs) {
    const rows = byLabel.get(slug)!;
    const patch: Record<string, string> = {};
    for (const row of rows) {
      if (row.column === "colorFr") continue;
      patch[row.column] = row.to;
    }
    if (Object.keys(patch).length) {
      await db.product.update({ where: { slug }, data: patch });
    }
    // One `updateMany` per colour covers every size of that colour at once.
    for (const colour of new Set(
      rows.filter((r) => r.column === "colorFr").map((r) => r.from),
    )) {
      const translated = FRENCH_COLOURS[colour];
      const variants = await db.variant.findMany({
        where: { product: { slug }, color: colour, colorFr: null },
        select: { id: true },
      });
      if (variants.length) {
        await db.variant.updateMany({
          where: { id: { in: variants.map((v) => v.id) } },
          data: { colorFr: translated },
        });
      }
    }
  }

  const settingsPatch: Record<string, string> = {};
  for (const change of changes) {
    if (change.label === "settings") settingsPatch[change.column] = change.to;
  }
  if (Object.keys(settingsPatch).length) {
    await db.siteSettings.update({ where: { id: "main" }, data: settingsPatch });
  }

  console.log("\nWritten.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());