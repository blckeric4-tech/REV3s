/**
 * Client-safe translation core.
 *
 * This module deliberately contains NO `next/headers`, no `cookies()` and no
 * `server-only` marker, so it can be imported from Client Components. The
 * server-only request-side resolver lives in `./index` and delegates here.
 *
 * Why this matters: React cannot serialise a *function* across the
 * server -> client boundary. Passing `t` as a prop from a Server Component
 * into a `"use client"` component throws at request time (not at build time),
 * which takes the whole page down. Only plain data such as a locale string can
 * cross. So client components receive `locale` and build their own `t` here.
 */
import { en, type Dictionary, type TranslationKey } from "./en";
import { fr } from "./fr";
import { DEFAULT_LOCALE, type Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Replaces `{name}` placeholders. Unknown placeholders are left in place. */
function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

export type Translate = (
  key: TranslationKey,
  values?: Record<string, string | number>
) => string;

/**
 * A `t` bound to one locale, usable from either a Server or a Client Component.
 *
 *     const t = makeTranslator(locale);
 *     t("cart.empty")
 *     t("product.lowStock", { count: 3 })
 *
 * A missing key returns the key itself rather than throwing: a missing
 * translation should be obvious in the page, not take the shop down.
 */
export function makeTranslator(locale: Locale): Translate {
  const dictionary = getDictionary(locale);
  return (key, values) => interpolate(dictionary[key] ?? key, values);
}

/**
 * Status values are stored uppercase in the database (`PAID`, `SHIPPED`, ...).
 * `status.PAID` is the key, so this maps one to the other. Anything
 * unrecognised falls back to the raw value rather than showing a key.
 */
export function statusKey(status: string): TranslationKey | null {
  const key = `status.${status.toUpperCase()}` as TranslationKey;
  return key in en ? key : null;
}

export type { Locale, TranslationKey, Dictionary };