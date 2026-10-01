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

export type ActionState = { ok: boolean; message: string; errors?: Record<string, string> };

/* ------------------------------- auth ------------------------------- */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { ok: false, message: "Those credentials are not recognised." };
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .regex(/[a-zA-Z]/, "Include a letter.")
  .regex(/[0-9]/, "Include a number.");

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
    return { ok: false, message: "Your current password is wrong." };
  }
  if (next !== confirm) {
    return { ok: false, message: "The new passwords do not match." };
  }
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Weak password." };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });

  return { ok: true, message: "Password updated." };
}

/* ----------------------------- products ----------------------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "Give the product a name."),
  slug: z.string().trim().min(2, "Add a URL slug."),
  tagline: z.string().trim().optional(),
  description: z.string().trim().min(10, "Write a longer description."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  comparePrice: z.coerce.number().min(0).optional(),
  category: z.string().trim().min(1, "Pick a category."),
  badge: z.string().trim().optional(),
  image: z.string().trim().min(1, "Add a main image path."),
  images: z.string().trim().optional(),
  onBodyImages: z.string().trim().optional(),
});

type VariantInput = {
  id?: string;
  size: string;
  color: string;
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
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
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
    return {
      ok: false,
      message: err instanceof ImageStoreError ? err.message : "Could not process the images.",
    };
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
  };

  try {
    if (id) {
      const existing = await db.product.findUnique({
        where: { id },
        include: { variants: true },
      });
      if (!existing) return { ok: false, message: "That product no longer exists." };

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
    const message =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "That slug or SKU is already used by another product."
        : e instanceof Error
          ? e.message
          : "Could not save the product.";
    return { ok: false, message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true, message: "Product saved." };
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
 */
async function settle<T>(
  run: () => Promise<T>,
  label: string,
  fallback: T,
  warnings: string[]
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const why = err instanceof ImageStoreError ? err.message : "could not be processed";
    warnings.push(`${label}: ${why}`);
    return fallback;
  }
}

/**
 * Mirror a list of images, dropping only the entries that fail so one dead URL
 * cannot empty the whole gallery.
 */
async function settleList(
  raw: string,
  label: string,
  warnings: string[]
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
    const why = err instanceof ImageStoreError ? err.message : "could not be processed";
    warnings.push(`${label}: ${why}`);
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

  const warnings: string[] = [];

  // Any pasted media URL is mirrored into public/uploads so the storefront
  // never has to render an unconfigured remote host.
  const [heroImage, storyImage, gallery, poster, heroVideo] = await Promise.all([
    settle(
      () => mirrorImageValue(text("heroImage") || "/images/hero.svg"),
      "Hero image",
      "/images/hero.svg",
      warnings
    ),
    settle(
      () => mirrorImageValue(text("storyImage") || "/images/story.svg"),
      "Story image",
      "/images/story.svg",
      warnings
    ),
    settleList(text("galleryImages"), "Scrolling strip image", warnings),
    // The poster is optional: an empty field must stay empty, not throw.
    settle(
      () => (text("videoPoster") ? mirrorImageValue(text("videoPoster")) : Promise.resolve("")),
      "Video poster",
      "",
      warnings
    ),
    // Same for the hero video — an empty field simply means "no video".
    settle(
      () => (text("heroVideo") ? mirrorVideoValue(text("heroVideo")) : Promise.resolve("")),
      "Hero video",
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
