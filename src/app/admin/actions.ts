"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { slugify } from "@/lib/cart";
import {
  ImageStoreError,
  mirrorImageList,
  mirrorImageValue,
  mirrorVideoValue,
} from "@/lib/image-store";
import {
  assertAdmin,
  createSession,
  destroySession,
  verifyCredentials,
} from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { TranslationKey } from "@/lib/i18n/en";
import { asKey, type ActionState } from "./action-state";

export type { ActionState } from "./action-state";

/** Shorthand: an action almost always returns a bare message and nothing else. */
const fail = (messageKey: ActionState["messageKey"]): ActionState => ({
  ok: false,
  messageKey,
});
const done = (messageKey: ActionState["messageKey"]): ActionState => ({
  ok: true,
  messageKey,
});

/* ------------------------------- auth ------------------------------- */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return fail("adminLogin.enterBoth");
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return fail("adminLogin.badCredentials");
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* The messages here are translation keys, resolved by the client — see
   `./action-state.ts`. */
const passwordSchema = z
  .string()
  .min(10, "error.passwordShort")
  .regex(/[a-zA-Z]/, "error.passwordLetter")
  .regex(/[0-9]/, "error.passwordNumber");

export async function changePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await assertAdmin();

  if (!(await bcrypt.compare(current, user.passwordHash))) {
    return fail("admin.wrongCurrentPassword");
  }
  if (next !== confirm) {
    return fail("admin.newPasswordMismatch");
  }
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const key = asKey(issue?.message ?? "error.weakPassword");
    // Only the length rule interpolates; the other two are fixed sentences.
    return { ok: false, messageKey: key, values: { min: 10 } };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });

  return done("success.passwordUpdated");
}

/* ----------------------------- products ----------------------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "adminForm.nameRequired"),
  slug: z.string().trim().min(2, "adminForm.slugRequired"),
  tagline: z.string().trim().optional(),
  description: z.string().trim().min(10, "adminForm.descriptionRequired"),
  price: z.coerce.number().min(0, "adminForm.priceNegative"),
  comparePrice: z.coerce.number().min(0).optional(),
  category: z.string().trim().min(1, "adminForm.categoryRequired"),
  badge: z.string().trim().optional(),
  image: z.string().trim().min(1, "adminForm.imageRequired"),
  images: z.string().trim().optional(),
  onBodyImages: z.string().trim().optional(),
  // French copy. Optional by design: a blank value stores NULL, which is what
  // makes the storefront fall back to the English field above.
  nameFr: z.string().trim().optional(),
  taglineFr: z.string().trim().optional(),
  descriptionFr: z.string().trim().optional(),
  badgeFr: z.string().trim().optional(),
});

type VariantInput = {
  id?: string;
  size: string;
  color: string;
  colorFr: string;
  colorHex: string;
  stock: number;
  sku: string;
};

function parseVariants(raw: FormDataEntryValue | null): VariantInput[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => ({
        id: typeof v.id === "string" && v.id ? v.id : undefined,
        size: String(v.size ?? "").trim(),
        color: String(v.color ?? "").trim(),
        colorFr: String(v.colorFr ?? "").trim(),
        colorHex: String(v.colorHex ?? "#000000").trim(),
        stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        sku: String(v.sku ?? "").trim(),
      }))
      .filter((v) => v.size && v.color);
  } catch {
    return [];
  }
}

export async function saveProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline") ?? "",
    description: formData.get("description"),
    price: formData.get("price"),
    comparePrice: formData.get("comparePrice") || 0,
    category: formData.get("category"),
    badge: formData.get("badge") ?? "",
    image: formData.get("image"),
    images: formData.get("images") ?? "",
    onBodyImages: formData.get("onBodyImages") ?? "",
    nameFr: formData.get("nameFr") ?? "",
    taglineFr: formData.get("taglineFr") ?? "",
    descriptionFr: formData.get("descriptionFr") ?? "",
    badgeFr: formData.get("badgeFr") ?? "",
  });

  if (!parsed.success) {
    // First failure per field wins, so the admin sees one message at a time.
    const errors: NonNullable<ActionState["errors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!errors[field]) errors[field] = asKey(issue.message);
    }
    return { ok: false, messageKey: "error.fixFields", errors };
  }

  const d = parsed.data;

  const variants = parseVariants(formData.get("variants"));

  let mirroredImage: string;
  let mirroredImages: string | null;
  let mirroredOnBody: string | null;
  try {
    [mirroredImage, mirroredImages, mirroredOnBody] = await Promise.all([
      mirrorImageValue(d.image),
      mirrorImageList(d.images),
      mirrorImageList(d.onBodyImages),
    ]);
  } catch (err) {
    return fail(
      err instanceof ImageStoreError ? "admin.imageProcessFailed" : "admin.productSaveFailed"
    );
  }

  const data = {
    name: d.name,
    slug: slugify(d.slug),
    tagline: d.tagline || null,
    description: d.description,
    priceCents: Math.round(d.price * 100),
    compareCents: d.comparePrice ? Math.round(d.comparePrice * 100) : null,
    category: d.category,
    badge: d.badge || null,
    image: mirroredImage,
    images: mirroredImages,
    onBodyImages: mirroredOnBody,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    // An empty French box is stored as NULL rather than "", so the storefront
    // fallback in `localizeProduct()` treats "cleared" and "never filled in"
    // the same way.
    nameFr: d.nameFr || null,
    taglineFr: d.taglineFr || null,
    descriptionFr: d.descriptionFr || null,
    badgeFr: d.badgeFr || null,
  };

  try {
    if (id) {
      const existing = await db.product.findUnique({
        where: { id },
        include: { variants: true },
      });
      if (!existing) return fail("admin.productGone");

      await db.$transaction(async (tx) => {
        await tx.product.update({ where: { id }, data });

        const keepIds = new Set(variants.map((v) => v.id).filter(Boolean) as string[]);
        // Remove variants the admin deleted, as long as they were never sold.
        for (const old of existing.variants) {
          if (!keepIds.has(old.id)) {
            const sold = await tx.orderItem.count({ where: { variantId: old.id } });
            if (sold === 0) {
              await tx.variant.delete({ where: { id: old.id } });
            }
          }
        }

        for (const v of variants) {
          if (v.id) {
            const old = existing.variants.find((x) => x.id === v.id);
            if (!old) continue;
            const sold = await tx.orderItem.count({ where: { variantId: v.id } });
            await tx.variant.update({
              where: { id: v.id },
              data: {
                size: v.size,
                color: v.color,
                colorFr: v.colorFr || null,
                colorHex: v.colorHex,
                sku: v.sku || old.sku,
                // Never let stock drift below what has already been sold.
                stock: sold > 0 ? Math.max(v.stock, 0) : v.stock,
              },
            });
          } else {
            await tx.variant.create({
              data: {
                productId: id,
                size: v.size,
                color: v.color,
                colorFr: v.colorFr || null,
                colorHex: v.colorHex,
                stock: v.stock,
                sku:
                  v.sku ||
                  `RV3-${slugify(d.slug).slice(0, 6).toUpperCase()}-${v.color
                    .slice(0, 2)
                    .toUpperCase()}-${v.size.toUpperCase()}-${Math.random()
                    .toString(36)
                    .slice(2, 5)
                    .toUpperCase()}`,
              },
            });
          }
        }
      });
    } else {
      const created = await db.product.create({
        data: {
          ...data,
          variants: {
            create: variants.map((v) => ({
              size: v.size,
              color: v.color,
              colorFr: v.colorFr || null,
              colorHex: v.colorHex,
              stock: v.stock,
              sku:
                v.sku ||
                `RV3-${slugify(d.slug).slice(0, 6).toUpperCase()}-${v.color
                  .slice(0, 2)
                  .toUpperCase()}-${v.size.toUpperCase()}-${Math.random()
                  .toString(36)
                  .slice(2, 5)
                  .toUpperCase()}`,
            })),
          },
        },
      });
      revalidatePath("/admin/products");
      redirect(`/admin/products/${created.id}?saved=1`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return fail("admin.duplicateSlug");
    }
    return fail("admin.productSaveFailed");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return done("success.productSaved");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.product.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function toggleProductActive(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;
  await db.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleFeatured(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return;
  await db.product.update({ where: { id }, data: { featured: !product.featured } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function quickStockUpdate(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("variantId") ?? "");
  const stock = Math.max(0, Math.floor(Number(formData.get("stock")) || 0));
  if (!id) return;
  await db.variant.update({ where: { id }, data: { stock } }).catch(() => undefined);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

/* ------------------------------ orders ------------------------------ */

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export async function updateOrderStatus(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status)) return;
  await db.order.update({ where: { id }, data: { status } }).catch(() => undefined);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

/* ----------------------------- settings ----------------------------- */

/**
 * Run one image step. On failure record a warning and use the fallback so a
 * single unreachable URL cannot block the rest of the settings save.
 *
 * The warning is a translation key, not a sentence: it is passed through the
 * query string to the settings page and rendered by the admin's own translator,
 * so it cannot be baked into English here.
 */
async function settle<T>(
  run: () => Promise<T>,
  label: TranslationKey,
  fallback: T,
  warnings: TranslationKey[]
): Promise<T> {
  try {
    return await run();
  } catch {
    warnings.push(label);
    return fallback;
  }
}

/**
 * Mirror a list of images, dropping only the entries that fail so one dead URL
 * cannot empty the whole gallery.
 */
async function settleList(
  raw: string,
  label: TranslationKey,
  warnings: TranslationKey[]
): Promise<string[]> {
  const items = raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return [];

  const results = await Promise.all(
    items.map((item) =>
      mirrorImageValue(item).then(
        (path): [string | null, unknown] => [path, null],
        (err): [string | null, unknown] => [null, err]
      )
    )
  );

  const kept: string[] = [];
  for (const [path, err] of results) {
    if (path) {
      kept.push(path);
      continue;
    }
    void err;
    warnings.push(label);
  }
  return kept;
}

export async function saveSettings(formData: FormData) {
  await assertAdmin();

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const num = (name: string, fallback: number) => {
    const v = Number(formData.get(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const bool = (name: string) => formData.get(name) === "on";
  // Accepts both one-per-line (the textarea) and comma-separated (the image
  // picker) so the admin can use either control.
  const list = (name: string) => {
    const raw = text(name);
    return JSON.stringify(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  };

  const hex = (name: string, fallback: string) => {
    const v = text(name);
    return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback;
  };

  // A French box the admin left empty stores NULL, not "". `localizeSettings()`
  // falls back on both, but NULL keeps the column honest: nothing entered means
  // nothing stored, which is easier to reason about when debugging in Studio.
  const fr = (name: string) => text(name) || null;

  const warnings: TranslationKey[] = [];

  // Any pasted media URL is mirrored into public/uploads so the storefront
  // never has to render an unconfigured remote host.
  const [heroImage, storyImage, gallery, poster, heroVideo] = await Promise.all([
    settle(
      () => mirrorImageValue(text("heroImage") || "/images/hero.svg"),
      "adminSet.warnHeroImage",
      "/images/hero.svg",
      warnings
    ),
    settle(
      () => mirrorImageValue(text("storyImage") || "/images/story.svg"),
      "adminSet.warnStoryImage",
      "/images/story.svg",
      warnings
    ),
    settleList(text("galleryImages"), "adminSet.warnGalleryImage", warnings),
    // The poster is optional: an empty field must stay empty, not throw.
    settle(
      () => (text("videoPoster") ? mirrorImageValue(text("videoPoster")) : Promise.resolve("")),
      "adminSet.warnVideoPoster",
      "",
      warnings
    ),
    // Same for the hero video — an empty field simply means "no video".
    settle(
      () => (text("heroVideo") ? mirrorVideoValue(text("heroVideo")) : Promise.resolve("")),
      "adminSet.warnHeroVideo",
      "",
      warnings
    ),
  ]);

  const data = {
    // brand
    siteName: text("siteName") || "RAV3S",
    tagline: text("tagline"),
    logoText: text("logoText") || "RAV3S",
    logoMark: text("logoMark"),
    // colours
    colorInk: hex("colorInk", "#000000"),
    colorBone: hex("colorBone", "#FFFFFF"),
    colorVolt: hex("colorVolt", "#000000"),
    colorClay: hex("colorClay", "#000000"),
    colorHaze: hex("colorHaze", "#737373"),
    // announcement
    announcementOn: bool("announcementOn"),
    announcementText: text("announcementText"),
    // international contact
    whatsappNumber: text("whatsappNumber"),
    whatsappMessage: text("whatsappMessage"),
    whatsappOn: bool("whatsappOn"),
    phoneNumber: text("phoneNumber"),
    mapAddress: text("mapAddress"),
    mapEmbedUrl: text("mapEmbedUrl"),
    tiktokUrl: text("tiktokUrl"),
    facebookUrl: text("facebookUrl"),
    instagramUrl: text("instagramUrl"),
    // media
    heroVideo,
    galleryImages: JSON.stringify(gallery),
    videoPoster: poster,
    heroFit: text("heroFit") === "cover" ? "cover" : "contain",
    // hero
    heroKicker: text("heroKicker"),
    heroTitle: text("heroTitle"),
    heroBody: text("heroBody"),
    heroCtaText: text("heroCtaText"),
    heroCtaHref: text("heroCtaHref") || "/shop",
    heroSecondaryText: text("heroSecondaryText"),
    heroSecondaryHref: text("heroSecondaryHref") || "/shop",
    heroImage,
    heroHeight: text("heroHeight") || "tall",
    // story
    storyKicker: text("storyKicker"),
    storyTitle: text("storyTitle"),
    storyBody: text("storyBody"),
    storyImage,
    // lists
    valueProps: list("valueProps"),
    categories: list("categories"),
    // shop
    shopTitle: text("shopTitle"),
    shopDescription: text("shopDescription"),
    // newsletter
    newsletterTitle: text("newsletterTitle"),
    newsletterBody: text("newsletterBody"),
    newsletterEnabled: bool("newsletterEnabled"),
    // footer
    footerAbout: text("footerAbout"),
    footerInstagram: text("footerInstagram"),
    footerTiktok: text("footerTiktok"),
    footerEmail: text("footerEmail"),
    footerAddress: text("footerAddress"),
    // commerce
    currency: text("currency") || "rwf",
    shippingFlatCents: Math.round(num("shippingFlat", 300000)),
    freeShippingOverCents: Math.round(num("freeShippingOver", 5000000)),
    lowStockThreshold: Math.round(num("lowStockThreshold", 5)),
    // ── French overrides ──
    // Only prose has a French column. Brand marks, contact details, URLs,
    // colours, media and commerce rules are shared across languages.
    taglineFr: fr("taglineFr"),
    announcementTextFr: fr("announcementTextFr"),
    whatsappMessageFr: fr("whatsappMessageFr"),
    heroKickerFr: fr("heroKickerFr"),
    heroTitleFr: fr("heroTitleFr"),
    heroBodyFr: fr("heroBodyFr"),
    heroCtaTextFr: fr("heroCtaTextFr"),
    heroSecondaryTextFr: fr("heroSecondaryTextFr"),
    storyKickerFr: fr("storyKickerFr"),
    storyTitleFr: fr("storyTitleFr"),
    storyBodyFr: fr("storyBodyFr"),
    shopTitleFr: fr("shopTitleFr"),
    shopDescriptionFr: fr("shopDescriptionFr"),
    newsletterTitleFr: fr("newsletterTitleFr"),
    newsletterBodyFr: fr("newsletterBodyFr"),
    footerAboutFr: fr("footerAboutFr"),
    // These two are ordered lists that line up with `valueProps` and
    // `categories`, so they go through `list()` and fall back per index.
    valuePropsFr: list("valuePropsFr"),
    categoriesFr: list("categoriesFr"),
  };

  await db.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  const qs = warnings.length
    ? `warn=${encodeURIComponent(warnings.join(" | "))}`
    : "saved=1";
  redirect(`/admin/settings?${qs}`);
}
