import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import {
  LOCALE_TAGS,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  matchLocale,
  type Locale,
} from "./config";
import { makeTranslator, type Translate } from "./translate";

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

/**
 * Locale + translator for Server Components.
 *
 * NOTE: the returned `t` must never be passed as a prop into a `"use client"`
 * component — functions are not serialisable across the RSC boundary and doing
 * so throws at request time. Hand the client component `locale` instead and let
 * it call `makeTranslator(locale)` from `./translate`.
 */
export async function getTranslator(): Promise<{ locale: Locale; t: Translate; tag: string }> {
  const locale = await getLocale();
  return {
    locale,
    tag: LOCALE_TAGS[locale],
    t: makeTranslator(locale),
  };
}

export { getDictionary, makeTranslator, statusKey } from "./translate";
export type { Locale, Translate, TranslationKey, Dictionary } from "./translate";