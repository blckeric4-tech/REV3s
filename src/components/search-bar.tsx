"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/translate";
import { makeTranslator } from "@/lib/i18n/translate";

export function SearchBar({
  defaultValue = "",
  locale,
}: {
  defaultValue?: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const t = makeTranslator(locale);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value.trim());
        router.push(`/shop${params.toString() ? `?${params}` : ""}`);
      }}
      className="flex items-center"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("shop.search")}
        aria-label={t("shop.searchPlaceholder")}
        className="field w-36 py-2 text-xs sm:w-44"
      />
    </form>
  );
}