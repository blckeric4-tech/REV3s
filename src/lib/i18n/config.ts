/**
 * Supported locales.
 *
 * The locale is stored in a cookie rather than in the URL. That is a deliberate
 * trade-off: URL-prefixed routing (`/fr/shop`) is better for SEO and for
 * sharing a link in a given language, but it means every route, link, redirect
 * and `proxy.ts` guard has to be locale-aware, and a mistake there breaks
 * navigation or leaks a signed-in customer into a redirect loop.
 *
 * A cookie keeps all existing links, the admin guard and the customer guard
 * untouched. The cost is that a French URL is not indexable as French — worth
 * revisiting if organic search in French ever matters more than the risk.
 */

export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie read by the server components and written by the switcher. */
export const LOCALE_COOKIE = "rav3s_locale";

/** BCP 47 tags, for `lang` on <html> and for `Intl` formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** Short form for the switcher button, where "Français" will not fit. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Best-effort match of an `Accept-Language` header to a supported locale.
 * Only the primary subtag matters here: `fr-CA`, `fr-FR` and `fr` all mean "French
 * to us". Returns null when nothing matches, so the caller can fall back.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      // `q=0` means "explicitly not acceptable".
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return null;
}
