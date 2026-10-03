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
 *     npm run db:french          # report what it would change
 *     npm run db:french -- --apply   # actually write
 *
 * Product names, descriptions and colours are deliberately not touched. Those
 * are the shop's real catalogue rather than template text, so they are left for
 * the admin to translate on each product page.
 */
import { PrismaClient } from "@prisma/client";
import { SITE_SETTINGS_DEFAULTS } from "../src/lib/settings-defaults";

const APPLY = process.argv.includes("--apply");

/** Every French column on SiteSettings, i.e. the `*Fr` entries of the defaults. */
const FRENCH_FIELDS = Object.keys(SITE_SETTINGS_DEFAULTS).filter((key) =>
  key.endsWith("Fr"),
) as (keyof typeof SITE_SETTINGS_DEFAULTS & `...${string}`)[];

const db = new PrismaClient();

async function main() {
  console.log(
    `${APPLY ? "Applying" : "Dry run:"} French template copy for ${FRENCH_FIELDS.length} settings field(s).\n`,
  );

  const existing = await db.siteSettings.findUnique({ where: { id: "main" } });

  if (!existing) {
    console.log("No SiteSettings row yet — nothing to backfill.");
    console.log("A fresh database picks these up automatically via getSettings().");
    return;
  }

  const patch: Record<string, string> = {};
  const skipped: string[] = [];

  for (const field of FRENCH_FIELDS) {
    const current = existing[field];
    const isBlank = current === null || current === undefined || String(current).trim() === "";
    if (isBlank) {
      patch[field] = SITE_SETTINGS_DEFAULTS[field] as string;
    } else {
      skipped.push(field);
    }
  }

  if (!Object.keys(patch).length) {
    console.log("Every French column already has copy. Nothing to do.");
    if (skipped.length) console.log(`Left untouched: ${skipped.join(", ")}`);
    return;
  }

  console.log(`Will fill ${Object.keys(patch).length} column(s):`);
  for (const [field, value] of Object.entries(patch)) {
    console.log(`  ${field} = ${JSON.stringify(value.slice(0, 70))}`);
  }
  if (skipped.length) {
    console.log(`\nLeft untouched (already has French copy): ${skipped.join(", ")}`);
  }

  if (APPLY) {
    await db.siteSettings.update({ where: { id: "main" }, data: patch });
    console.log("\nWritten.");
  } else {
    console.log("\nRe-run with --apply to write these.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());