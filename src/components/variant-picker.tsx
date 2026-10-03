"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/translate";
import { makeTranslator } from "@/lib/i18n/translate";
import { LOCALE_TAGS } from "@/lib/i18n/config";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
};

export function VariantPicker({
  variants,
  slug,
  name,
  priceCents,
  image,
  currency,
  lowStockThreshold,
  locale,
}: {
  variants: Variant[];
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  currency: string;
  lowStockThreshold: number;
  locale: Locale;
}) {
  const { add } = useCart();
  const t = makeTranslator(locale);
  const tag = LOCALE_TAGS[locale];

  const colors = useMemo(() => {
    const map = new Map<string, { color: string; colorHex: string }>();
    for (const v of variants) map.set(v.color, { color: v.color, colorHex: v.colorHex });
    return [...map.values()];
  }, [variants]);

  const sizes = useMemo(() => {
    const seen = new Set<string>();
    return variants.filter((v) => !seen.has(v.size) && seen.add(v.size)).map((v) => v.size);
  }, [variants]);

  const [color, setColor] = useState(colors[0]?.color ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.color === color && v.size === size);
  const inStock = (v: Variant) => v.stock > 0;
  const availableForColor = (c: string) => variants.some((v) => v.color === c && inStock(v));
  const sizeAvailable = (s: string) => {
    const v = variants.find((x) => x.color === color && x.size === s);
    return v ? inStock(v) : false;
  };

  function addToBag() {
    if (!selected || selected.stock === 0) return;
    add(
      {
        variantId: selected.id,
        slug,
        name,
        size: selected.size,
        color: selected.color,
        colorHex: selected.colorHex,
        image,
        priceCents,
        stock: selected.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  const soldOut = variants.every((v) => v.stock === 0);

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-semibold">{formatMoney(priceCents, currency, tag)}</p>
      </div>

      {/* Colour */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="label-xs text-fg/65">{t("product.colour")}</p>
          <p className="text-xs text-fg/70">{color}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {colors.map((c) => {
            const active = c.color === color;
            const ok = availableForColor(c.color);
            return (
              <button
                key={c.color}
                type="button"
                onClick={() => setColor(c.color)}
                title={c.color}
                aria-label={c.color}
                aria-pressed={active}
                className={`relative h-10 w-10 rounded-full ring-offset-2 transition-all ${
                  active ? "ring-2 ring-fg" : "ring-1 ring-fg/15 hover:ring-fg/40"
                }`}
                style={{ backgroundColor: c.colorHex }}
              >
                {!ok ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-[1.5px] w-6 rotate-45 bg-fg" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <p className="label-xs text-fg/65">{t("product.size")}</p>
          <a href="/size-guide" className="text-xs text-fg/70 underline underline-offset-4 hover:text-fg">
            {t("product.sizeGuide")}
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const ok = sizeAvailable(s);
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                disabled={!ok}
                onClick={() => setSize(s)}
                className={`label-xs min-w-14 rounded-full border px-4 py-3 transition-colors ${
                  active
                    ? "border-fg bg-inverse text-inverse-fg"
                    : ok
                      ? "border-line text-fg hover:border-fg"
                      : "border-line text-fg/70 line-through"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + add */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-12 w-12 text-lg"
            aria-label={t("product.decreaseQty")}
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
            className="h-12 w-12 text-lg"
            aria-label={t("product.increaseQty")}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={addToBag}
          disabled={!selected || selected.stock === 0}
          className="btn btn-primary h-12 flex-1"
        >
          {soldOut
            ? t("product.soldOut")
            : !size
              ? t("product.selectSize")
              : selected?.stock === 0
                ? t("product.soldOut")
                : added
                  ? t("product.addedToBag")
                  : t("product.addToBag")}
        </button>
      </div>

      {selected && selected.stock > 0 && selected.stock <= lowStockThreshold ? (
        <p className="mt-3 text-xs font-medium text-fg">
          {t("product.onlyLeftIn", {
            count: selected.stock,
            size: selected.size,
            colour: selected.color,
          })}
        </p>
      ) : null}

      {added ? (
        <p className="mt-3 text-xs font-medium text-fg/70" role="status">
          {t("product.addedViewBag")}{" "}
          <a href="/cart" className="underline underline-offset-4">{t("product.viewBag")}</a>
        </p>
      ) : null}
    </div>
  );
}
