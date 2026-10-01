import { cache } from "react";
import { db } from "@/lib/prisma";
import { parseList } from "@/lib/money";

/**
 * The single source of truth for everything the admin can edit.
 * Falls back to a fresh singleton row if the DB is empty.
 */
export const getSettings = cache(async () => {
  const existing = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  return db.siteSettings.create({ data: { id: "main" } });
});

export type Settings = Awaited<ReturnType<typeof getSettings>>;

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
