import { cache } from "react";
import { db } from "@/lib/prisma";
import { parseList } from "@/lib/money";
import { SITE_SETTINGS_DEFAULTS } from "@/lib/settings-defaults";
import { pick, pickList } from "@/lib/localize";
import type { Locale } from "@/lib/i18n/config";

/**
 * The single source of truth for everything the admin can edit.
 * Falls back to a fresh singleton row if the DB is empty.
 */
export const getSettings = cache(async () => {
  const existing = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  // The TEXT columns carry no database default — MySQL/TiDB will not allow one —
  // so a brand new database has to be given the full field set here.
  return db.siteSettings.create({ data: { id: "main", ...SITE_SETTINGS_DEFAULTS } });
});

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/**
 * The site copy a page should render, with every French override already
 * applied. Brand marks (siteName, logoText, logoMark) and proper nouns
 * (mapAddress, footerAddress, footerEmail) are passed through untouched because
 * they do not translate; URLs, colours and commerce rules are never localized.
 */
export type LocalizedSettings = Settings &
  Pick<
    Settings,
    | "siteName"
    | "logoText"
    | "logoMark"
    | "announcementOn"
    | "whatsappNumber"
    | "whatsappOn"
    | "phoneNumber"
    | "mapAddress"
    | "mapEmbedUrl"
    | "tiktokUrl"
    | "facebookUrl"
    | "instagramUrl"
    | "heroVideo"
    | "galleryImages"
    | "videoPoster"
    | "heroFit"
    | "heroCtaHref"
    | "heroSecondaryHref"
    | "heroImage"
    | "heroHeight"
    | "storyImage"
    | "newsletterEnabled"
    | "footerInstagram"
    | "footerTiktok"
    | "footerEmail"
    | "footerAddress"
    | "currency"
    | "shippingFlatCents"
    | "freeShippingOverCents"
    | "lowStockThreshold"
    | "colorInk"
    | "colorBone"
    | "colorVolt"
    | "colorClay"
    | "colorHaze"
  > & {
    tagline: string;
    announcementText: string;
    whatsappMessage: string;
    heroKicker: string;
    heroTitle: string;
    heroBody: string;
    heroCtaText: string;
    heroSecondaryText: string;
    storyKicker: string;
    storyTitle: string;
    storyBody: string;
    shopTitle: string;
    shopDescription: string;
    newsletterTitle: string;
    newsletterBody: string;
    footerAbout: string;
  };

/**
 * Resolve a settings row for one locale.
 *
 * Server-only: it takes the raw row, so call it right after `getSettings()`.
 * Client components should receive the already-localized result as a prop
 * rather than importing this, since `Settings` carries every raw column.
 */
export function localizeSettings(s: Settings, locale: Locale): LocalizedSettings {
  return {
    ...s,
    tagline: pick(locale, s.taglineFr, s.tagline),
    announcementText: pick(locale, s.announcementTextFr, s.announcementText),
    whatsappMessage: pick(locale, s.whatsappMessageFr, s.whatsappMessage),
    heroKicker: pick(locale, s.heroKickerFr, s.heroKicker),
    heroTitle: pick(locale, s.heroTitleFr, s.heroTitle),
    heroBody: pick(locale, s.heroBodyFr, s.heroBody),
    heroCtaText: pick(locale, s.heroCtaTextFr, s.heroCtaText),
    heroSecondaryText: pick(locale, s.heroSecondaryTextFr, s.heroSecondaryText),
    storyKicker: pick(locale, s.storyKickerFr, s.storyKicker),
    storyTitle: pick(locale, s.storyTitleFr, s.storyTitle),
    storyBody: pick(locale, s.storyBodyFr, s.storyBody),
    shopTitle: pick(locale, s.shopTitleFr, s.shopTitle),
    shopDescription: pick(locale, s.shopDescriptionFr, s.shopDescription),
    newsletterTitle: pick(locale, s.newsletterTitleFr, s.newsletterTitle),
    newsletterBody: pick(locale, s.newsletterBodyFr, s.newsletterBody),
    footerAbout: pick(locale, s.footerAboutFr, s.footerAbout),
  };
}

/** Locale-resolved settings in one call: `getLocalizedSettings()` then use it. */
export const getLocalizedSettings = cache(async (locale: Locale) => {
  const settings = await getSettings();
  return localizeSettings(settings, locale);
});

/** A category as the storefront links it: `key` filters, `label` is shown. */
export type CategoryLink = { key: string; label: string };

/**
 * Categories with their labels in the requested language. `key` stays the
 * English string because it is what `Product.category` and the `?category=`
 * query param hold, so switching language must never change a filter URL.
 */
export const getLocalizedCategories = cache(async (locale: Locale): Promise<CategoryLink[]> => {
  const s = await getSettings();
  const en = parseList(s.categories);
  const labels = pickList(locale, parseList(s.categoriesFr), en);
  return en.map((key, index) => ({ key, label: labels[index] }));
});

/** Value props for the homepage strip, already in the requested language. */
export const getLocalizedValueProps = cache(async (locale: Locale): Promise<string[]> => {
  const s = await getSettings();
  return pickList(locale, parseList(s.valuePropsFr), parseList(s.valueProps));
});

export const getCategories = cache(async (): Promise<string[]> => {
  const s = await getSettings();
  return parseList(s.categories);
});

export const getValueProps = cache(async (): Promise<string[]> => {
  const s = await getSettings();
  return parseList(s.valueProps);
});

/** Brand palette used for admin colour pickers + swatch previews. */
export const BRAND_FIELDS = [
  { key: "colorInk", label: "Ink (base)", fallback: "#000000" },
  { key: "colorBone", label: "Bone (background)", fallback: "#FFFFFF" },
  { key: "colorVolt", label: "Volt (accent)", fallback: "#000000" },
  { key: "colorClay", label: "Clay (highlight)", fallback: "#000000" },
  { key: "colorHaze", label: "Haze (muted text)", fallback: "#737373" },
] as const;

export type BrandFieldKey = (typeof BRAND_FIELDS)[number]["key"];
