"use client";

import { useActionState, useState } from "react";
import { saveProduct, type ActionState } from "@/app/admin/actions";
import { ImagePicker } from "@/components/admin/image-picker";

type Variant = {
  id?: string;
  size: string;
  color: string;
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
  featured: boolean;
  active: boolean;
  variants: Variant[];
};

const initial: ActionState = { ok: false, message: "" };

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
}: {
  seed: ProductSeed;
  categories: string[];
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveProduct, initial);
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
          Saved.
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-[var(--radius-card)] bg-fg/10 px-4 py-3 text-sm font-semibold text-fg" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Basics */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={err("name")}>
            <input
              name="name"
              defaultValue={seed.name}
              required
              className="field"
              placeholder="Core Heavyweight Tee"
            />
          </Field>
          <Field label="URL slug" error={err("slug")}>
            <input
              name="slug"
              defaultValue={seed.slug}
              required
              className="field font-mono text-sm"
              placeholder="core-heavyweight-tee"
            />
          </Field>
          <Field label="Tagline">
            <input
              name="tagline"
              defaultValue={seed.tagline}
              className="field"
              placeholder="240gsm loopback cotton"
            />
          </Field>
          <Field label="Category" error={err("category")}>
            <input
              name="category"
              defaultValue={seed.category}
              required
              list="category-list"
              className="field"
              placeholder="T-Shirts"
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Badge" hint="e.g. New, Best seller, Limited">
            <input name="badge" defaultValue={seed.badge} className="field" />
          </Field>
          <Field label="Description" error={err("description")} className="sm:col-span-2">
            <textarea
              name="description"
              defaultValue={seed.description}
              required
              rows={5}
              className="field"
              placeholder="What makes this piece worth buying?"
            />
          </Field>
        </div>
      </section>

      {/* Pricing */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">Pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={err("price")}>
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
          <Field label="Compare-at price" hint="Shown struck through. Optional.">
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
        <h2 className="label-xs text-fg/65">Images</h2>
        <p className="mt-2 text-xs text-fg/70">
          The first set is the garment on its own. The second set is the same garment
          worn by a model — customers scroll down to see how it fits.
        </p>

        <div className="mt-5 grid gap-6">
          <ImagePicker
            name="image"
            label="Garment on its own (flat shots)"
            hint="Upload from your computer, paste a URL, or type a path."
            defaultValue={seed.image}
            single
            error={err("image")}
          />
          <ImagePicker
            name="images"
            label="More flat shots"
            hint="Optional extra angles."
            defaultValue={seed.images}
          />
          <ImagePicker
            name="onBodyImages"
            label="Worn on a model"
            hint="Shown when the customer scrolls down the product page."
            defaultValue={seed.onBodyImages}
          />
        </div>
      </section>

      {/* Variants */}
      <section className="card p-5">
        <h2 className="label-xs text-fg/65">Sizes, colours &amp; stock</h2>

        <div className="mt-4 grid gap-3 rounded-lg border border-line bg-surface/60 p-4 sm:grid-cols-[1fr_1fr_5rem_auto]">
          <input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Colours (Ink Black, Volt)"
            className="field"
            aria-label="Colours"
          />
          <input
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            placeholder="Sizes (S, M, L)"
            className="field"
            aria-label="Sizes"
          />
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            min="0"
            placeholder="Stock"
            className="field"
            aria-label="Stock per variant"
          />
          <div className="flex gap-2">
            <button type="button" onClick={addVariants} className="btn btn-outline flex-1">
              Add grid
            </button>
            <button type="button" onClick={addSingle} className="btn btn-outline flex-1">
              Add
            </button>
          </div>
        </div>

        {variants.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-line py-8 text-center text-sm text-fg/65">
            No variants yet. Add colours and sizes above.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-fg/70">
                  <th className="py-2 pr-3">Size</th>
                  <th className="py-2 pr-3">Colour</th>
                  <th className="py-2 pr-3">Swatch</th>
                  <th className="py-2 pr-3">Stock</th>
                  <th className="py-2 pr-3">SKU</th>
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
                        aria-label={`Size for row ${i + 1}`}
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
                        aria-label={`Colour for row ${i + 1}`}
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
                        aria-label={`Swatch for row ${i + 1}`}
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
                        aria-label={`Stock for row ${i + 1}`}
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
                        placeholder="auto"
                        className="field w-32 py-1.5 font-mono text-xs"
                        aria-label={`SKU for row ${i + 1}`}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
                        className="px-2 text-fg/70 hover:text-fg"
                        aria-label={`Remove row ${i + 1}`}
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
          Visible in the shop
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={seed.featured}
            className="h-4 w-4 accent-fg"
          />
          Feature on the landing page
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving..." : seed.id ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-xs text-fg/65">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint && !error ? <span className="mt-1.5 block text-xs text-fg/65">{hint}</span> : null}
      {error ? <span className="mt-1.5 block text-xs text-fg">{error}</span> : null}
    </label>
  );
}
