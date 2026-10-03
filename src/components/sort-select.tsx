"use client";

import { useRef } from "react";
import type { Locale, TranslationKey } from "@/lib/i18n/translate";
import { makeTranslator } from "@/lib/i18n/translate";

const OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "newest", labelKey: "shop.sortNewest" },
  { value: "price-asc", labelKey: "shop.sortPriceAsc" },
  { value: "price-desc", labelKey: "shop.sortPriceDesc" },
  { value: "name", labelKey: "shop.sortNameAsc" },
];

/** Self-submitting sort control — onChange needs a Client Component. */
export function SortSelect({
  sort,
  category,
  query,
  locale,
}: {
  sort: string;
  category: string;
  query: string;
  locale: Locale;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const t = makeTranslator(locale);

  return (
    <form ref={formRef} action="/shop" className="flex items-center gap-2">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {query ? <input type="hidden" name="q" value={query} /> : null}

      <label htmlFor="sort" className="label-xs whitespace-nowrap text-fg/65">
        {t("shop.sort")}
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={sort}
        onChange={() => formRef.current?.requestSubmit()}
        className="field w-auto py-2 text-xs"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.labelKey)}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="label-xs border border-line px-3 py-2">
          {t("common.go")}
        </button>
      </noscript>
    </form>
  );
}