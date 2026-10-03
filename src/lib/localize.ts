import type { Locale } from "@/lib/i18n/config";

/**
 * Fallback rules for shop content that lives in the database.
 *
 * UI copy comes from `src/lib/i18n`, so it is always complete. The shop's own
 * content — product names, marketing copy, category labels — is typed into the
 * admin and stored once per row, with an optional `*Fr` companion column. The
 * columns are nullable with no default, which is what makes `prisma db push`
 * safe against an existing table and what makes a half-translated site
 * renderable rather than blank.
 *
 * The rule everywhere is the same: use the French value when it exists and is
 * not blank, otherwise show the English one. A missing translation degrades to
 * the original English instead of leaving a hole in the page.
 */

/** The French value when it is present and non-blank, else the English original. */
export function pick<T>(locale: Locale, fr: T | null | undefined, en: T): T {
  if (locale !== "fr") return en;
  if (fr === null || fr === undefined) return en;
  if (typeof fr === "string" && fr.trim() === "") return en;
  return fr;
}

/**
 * Merge a French list against its English counterpart element-wise.
 *
 * Categories and value props are stored as parallel JSON lists, so the fallback
 * is per index: filling in the first two of five French categories translates
 * those two and leaves the other three showing their English text.
 */
export function pickList<T>(locale: Locale, fr: T[], en: T[]): T[] {
  if (locale !== "fr" || fr.length === 0) return en;
  return en.map((value, index) => {
    const candidate = fr[index];
    if (candidate === undefined || candidate === null) return value;
    if (typeof candidate === "string" && candidate.trim() === "") return value;
    return candidate;
  });
}

/**
 * Structural shapes rather than the Prisma model types, so these helpers work
 * on a row with relations included, on a plain `select`, and inside client
 * components without dragging the generated client along.
 */
type TranslatableProduct = {
  name: string;
  nameFr: string | null;
  tagline: string | null;
  taglineFr: string | null;
  description: string;
  descriptionFr: string | null;
  badge: string | null;
  badgeFr: string | null;
};

type TranslatableVariant = {
  color: string;
  colorFr: string | null;
};

/**
 * Product copy in one language. Returned as a fresh object rather than a
 * mutated row so the raw columns can never leak into a rendered page by
 * accident; callers use these fields instead of `product.name` and friends.
 */
export function localizeProduct<T extends TranslatableProduct>(
  product: T,
  locale: Locale,
): { name: string; tagline: string | null; description: string; badge: string | null } {
  return {
    name: pick(locale, product.nameFr, product.name),
    tagline: pick(locale, product.taglineFr, product.tagline),
    description: pick(locale, product.descriptionFr, product.description),
    badge: pick(locale, product.badgeFr, product.badge),
  };
}

/** Colour name in one language. `colorHex` is never localized and stays put. */
export function localizeVariant<T extends TranslatableVariant>(
  variant: T,
  locale: Locale,
): { color: string } {
  return { color: pick(locale, variant.colorFr, variant.color) };
}