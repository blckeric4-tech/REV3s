import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { en, type Dictionary, type TranslationKey } from "./en";
import { fr } from "./fr";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_TAGS,
  isLocale,
  matchLocale,
  type Locale,
} from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, fr };

/**
 * The current locale.
 *
 * Precedence: the cookie the visitor set with the switcher, then their
 * `Accept-Language` header, then English. The header is only consulted when
 * there is no cookie, so an explicit choice is never overridden by a browser
 * default.
 *
 * `cache` dedupes this across the many server components on one render, so the
 * cookie/header read and the dictionary lookup happen once per request rather
 * than per component.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const requestHeaders = await headers();
  return matchLocale(requestHeaders.get("accept-language")) ?? DEFAULT_LOCALE;
});

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
 * A `t` bound to one locale.
 *
 *     const t = await getTranslator();
 *     t("cart.empty")
 *     t("product.lowStock", { count: 3 })
 *
 * A missing key returns the key itself rather than throwing: a missing
 * translation should be obvious in the page, not take the shop down.
 */
export async function getTranslator(): Promise<{ locale: Locale; t: Translate; tag: string }> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return {
    locale,
    tag: LOCALE_TAGS[locale],
    t: (key, values) => interpolate(dictionary[key] ?? key, values),
  };
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
