"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { initialActionState } from "@/app/admin/action-state";
import { ImagePicker } from "@/components/admin/image-picker";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/en";

type Variant = {
  id?: string;
  size: string;
  color: string;
  colorFr: string;
  colorHex: string;
  stock: number;
  sku: string;
};

export type ProductSeed = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  badge: string;
  image: string;
  images: string;
  onBodyImages: string;
  nameFr: string;
  taglineFr: string;
  descriptionFr: string;
  badgeFr: string;
  featured: boolean;
  active: boolean;
  variants: Variant[];
};

const SUGGESTED_COLORS: Record<string, string> = {
  "Ink Black": "#16171A",
  Bone: "#EFEAE1",
  Volt: "#D7FF3E",
  Clay: "#FF5A36",
  "Haze Grey": "#8A8F98",
  "Deep Navy": "#1B2A4A",
  Olive: "#5A5F3A",
  Sand: "#D6C7A8",
};

export function ProductForm({
  seed,
  categories,
  saved,
  locale,
}: {
  seed: ProductSeed;
  categories: string[];
  saved?: boolean;
  locale: Locale;
}) {
  const [state, action, pending] = useActionState(saveProduct, initialActionState);
  const t = makeTranslator(locale);
  const [variants, setVariants] = useState<Variant[]>(seed.variants);
  const [colorName, setColorName] = useState("");
  const [sizeName, setSizeName] = useState("");
  const [stock, setStock] = useState("5");

  function addVariants() {
    const colors = colorName
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const sizes = sizeName
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (colors.length === 0 || sizes.length === 0) return;

    const next: Variant[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        const exists = variants.some(
          (v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase()
        );
        if (exists) continue;
        next.push({
          size,
          color,
          colorFr: "",
          colorHex: SUGGESTED_COLORS[color] ?? "#888888",
          stock: Math.max(0, Number(stock) || 0),
          sku: "",
        });
      }
    }
    setVariants((prev) => [...prev, ...next]);
  }

  function addSingle() {
    if (!colorName.trim() || !sizeName.trim()) return;
    setVariants((prev) => [
      ...prev,
      {
        size: sizeName.trim(),
        color: colorName.trim(),
        colorFr: "",
        colorHex: SUGGESTED_COLORS[colorName.trim()] ?? "#888888",
        stock: Math.max(0, Number(stock) || 0),
        sku: "",
      },
    ]);
  }

  const err = (k: string) => state.errors?.[k];

  return (
    <form action={action} className="space-y-8">
      {seed.id ? <input type="hidden" name="id" value={seed.id} /> : null}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      {saved ? (
        <p className="rounded-[var(--radius-card)] bg-fg px-4 py-3 text-sm font-semibold">
          {t("adminForm.saved")}
        </p>
      ) : null}
      {state.messageKey ? (
        <p className="rounded-[var(--radius-card)] bg-fg/10 px-4 py-3 text-sm font-semibold text-fg" role="alert">
          {t(state.messageKey, state.values)}
        </p>
      ) : null}

      {/* Basics */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("adminForm.basics")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field locale={locale} label="adminForm.name" error={err("name")}>
            <input
              name="name"
              defaultValue={seed.name}
              required
              className="field"
              placeholder={t("adminForm.namePlaceholder")}
            />
          </Field>
          <Field locale={locale} label="adminForm.slug" error={err("slug")}>
            <input
              name="slug"
              defaultValue={seed.slug}
              required
              className="field font-mono text-sm"
              placeholder={t("adminForm.slugPlaceholder")}
            />
          </Field>
          <Field locale={locale} label="adminForm.tagline">
            <input
              name="tagline"
              defaultValue={seed.tagline}
              className="field"
              placeholder={t("adminForm.taglinePlaceholder")}
            />
          </Field>
          <Field locale={locale} label="adminForm.category" error={err("category")}>
            <input
              name="category"
              defaultValue={seed.category}
              required
              list="category-list"
              className="field"
              placeholder={t("adminForm.categoryPlaceholder")}
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field locale={locale} label="adminForm.badge" hint="adminForm.badgeHint">
            <input name="badge" defaultValue={seed.badge} className="field" />
          </Field>
          <Field
            locale={locale}
            label="adminForm.description"
            error={err("description")}
            className="sm:col-span-2"
          >
            <textarea
              name="description"
              defaultValue={seed.description}
              required
              rows={5}
              className="field"
              placeholder={t("adminForm.descriptionPlaceholder")}
            />
          </Field>
        </div>
      </section>

      {/* French copy */}
      {/* Its own block, mirroring the French block in the site settings: the
          admin needs to see the whole translation of a product in one place,
          and a blank box means "fall back to English" rather than an error. */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("adminForm.frenchTitle")}</h2>
        <p className="mt-2 text-xs text-fg/65">{t("adminForm.frenchHint")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field locale={locale} label="adminForm.name">
            <input
              name="nameFr"
              defaultValue={seed.nameFr}
              className="field"
              placeholder={t("adminForm.nameFrPlaceholder")}
            />
          </Field>
          <Field locale={locale} label="adminForm.badge">
            <input name="badgeFr" defaultValue={seed.badgeFr} className="field" />
          </Field>
          <Field locale={locale} label="adminForm.tagline">
            <input
              name="taglineFr"
              defaultValue={seed.taglineFr}
              className="field"
              placeholder={t("adminForm.taglinePlaceholder")}
            />
          </Field>
          <Field locale={locale} label="adminForm.description" className="sm:col-span-2">
            <textarea
              name="descriptionFr"
              rows={5}
              defaultValue={seed.descriptionFr}
              className="field"
              placeholder={t("adminForm.descriptionPlaceholder")}
            />
          </Field>
        </div>
      </section>

      {/* Pricing */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("adminForm.pricing")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field locale={locale} label="adminForm.price" error={err("price")}>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={seed.price}
              required
              className="field"
            />
          </Field>
          <Field
            locale={locale}
            label="adminForm.comparePrice"
            hint="adminForm.comparePriceHint"
          >
            <input
              name="comparePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={seed.comparePrice}
              className="field"
            />
          </Field>
        </div>
      </section>

      {/* Images */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("adminForm.images")}</h2>
        <p className="mt-2 text-xs text-fg/70">{t("adminForm.imagesBody")}</p>

        <div className="mt-5 grid gap-6">
          <ImagePicker
            name="image"
            locale={locale}
            label={t("adminForm.garmentFlat")}
            hint={t("adminForm.garmentFlatHint")}
            defaultValue={seed.image}
            single
            error={err("image")}
          />
          <ImagePicker
            name="images"
            locale={locale}
            label={t("adminForm.moreFlat")}
            hint={t("adminForm.moreFlatHint")}
            defaultValue={seed.images}
          />
          <ImagePicker
            name="onBodyImages"
            locale={locale}
            label={t("adminForm.onModel")}
            hint={t("adminForm.onModelHint")}
            defaultValue={seed.onBodyImages}
          />
        </div>
      </section>

      {/* Variants */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("adminForm.variantsTitle")}</h2>

        <div className="mt-4 grid gap-3 rounded-lg border border-line bg-surface/60 p-4 sm:grid-cols-[1fr_1fr_5rem_auto]">
          <input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder={t("adminForm.coloursPlaceholder")}
            className="field"
            aria-label={t("adminForm.colours")}
          />
          <input
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            placeholder={t("adminForm.sizesPlaceholder")}
            className="field"
            aria-label={t("adminForm.sizes")}
          />
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            min="0"
            placeholder={t("adminForm.stockPlaceholder")}
            className="field"
            aria-label={t("adminForm.stockPerVariant")}
          />
          <div className="flex gap-2">
            <button type="button" onClick={addVariants} className="btn btn-outline flex-1">
              {t("adminForm.addGrid")}
            </button>
            <button type="button" onClick={addSingle} className="btn btn-outline flex-1">
              {t("adminForm.add")}
            </button>
          </div>
        </div>

        {variants.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-line py-8 text-center text-sm text-fg/65">
            {t("adminForm.noVariants")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-fg/70">
                  <th className="py-2 pr-3">{t("adminForm.colSize")}</th>
                  <th className="py-2 pr-3">{t("adminForm.colColour")}</th>
                  <th className="py-2 pr-3">{t("adminForm.colColourFr")}</th>
                  <th className="py-2 pr-3">{t("adminForm.colSwatch")}</th>
                  <th className="py-2 pr-3">{t("adminForm.colStock")}</th>
                  <th className="py-2 pr-3">{t("adminForm.colSku")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id ?? `${v.color}-${v.size}-${i}`} className="border-b border-line/60">
                    <td className="py-2 pr-3">
                      <input
                        value={v.size}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, size: e.target.value } : x))
                          )
                        }
                        className="field py-1.5 text-xs"
                        aria-label={t("adminForm.sizeForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={v.color}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) =>
                              j === i
                                ? {
                                    ...x,
                                    color: e.target.value,
                                    colorHex: SUGGESTED_COLORS[e.target.value] ?? x.colorHex,
                                  }
                                : x
                            )
                          )
                        }
                        className="field py-1.5 text-xs"
                        aria-label={t("adminForm.colourForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={v.colorFr}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, colorFr: e.target.value } : x))
                          )
                        }
                        placeholder={t("adminForm.colourFrPlaceholder")}
                        className="field py-1.5 text-xs"
                        aria-label={t("adminForm.colourFrForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="color"
                        value={v.colorHex}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, colorHex: e.target.value } : x))
                          )
                        }
                        className="h-8 w-10 cursor-pointer rounded border border-line bg-surface p-0.5"
                        aria-label={t("adminForm.swatchForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) =>
                              j === i ? { ...x, stock: Number(e.target.value) || 0 } : x
                            )
                          )
                        }
                        className="field w-20 py-1.5 text-xs"
                        aria-label={t("adminForm.stockForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={v.sku}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x))
                          )
                        }
                        placeholder={t("adminForm.autoSku")}
                        className="field w-32 py-1.5 font-mono text-xs"
                        aria-label={t("adminForm.skuForRow", { n: i + 1 })}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
                        className="px-2 text-fg/70 hover:text-fg"
                        aria-label={t("adminForm.removeRow", { n: i + 1 })}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Visibility */}
      <section className="card flex flex-wrap items-center gap-6 p-5">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={seed.active}
            className="h-4 w-4 accent-fg"
          />
          {t("adminForm.visible")}
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={seed.featured}
            className="h-4 w-4 accent-fg"
          />
          {t("adminForm.featureLanding")}
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending
            ? t("adminForm.saving")
            : t(seed.id ? "adminForm.saveChanges" : "adminForm.createProduct")}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  locale,
  className = "",
  children,
}: {
  label: TranslationKey;
  hint?: TranslationKey;
  error?: TranslationKey;
  locale: Locale;
  className?: string;
  children: React.ReactNode;
}) {
  const t = makeTranslator(locale);
  return (
    <label className={`block ${className}`}>
      <span className="label-xs text-fg/65">{t(label)}</span>
      <span className="mt-2 block">{children}</span>
      {hint && !error ? <span className="mt-1.5 block text-xs text-fg/65">{t(hint)}</span> : null}
      {error ? <span className="mt-1.5 block text-xs text-fg">{t(error)}</span> : null}
    </label>
  );
}
