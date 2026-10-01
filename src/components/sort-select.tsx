"use client";

import { useRef } from "react";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Alphabetical" },
];

/** Self-submitting sort control — onChange needs a Client Component. */
export function SortSelect({
  sort,
  category,
  query,
}: {
  sort: string;
  category: string;
  query: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action="/shop" className="flex items-center gap-2">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {query ? <input type="hidden" name="q" value={query} /> : null}

      <label htmlFor="sort" className="label-xs whitespace-nowrap text-fg/65">
        Sort
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
            {o.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="label-xs border border-line px-3 py-2">
          Go
        </button>
      </noscript>
    </form>
  );
}
