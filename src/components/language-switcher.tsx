"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

/**
 * Client-side language switcher.
 *
 * Sets a cookie and refreshes the page. That is the simplest way to pick up a
 * new locale on *all* server components without changing routes or adding a
 * context provider to every page. A cookie is already how the server resolves
 * the locale (see src/lib/i18n/index.ts), so this keeps the single source of
 * truth.
 *
 * It does a full refresh (`router.refresh()`) rather than soft-navigation,
 * because many components (layout, metadata, server-rendered blocks) read the
 * locale from headers/cookies at request time and would not re-render
 * otherwise.
 */
export function LanguageSwitcher({
  current,
  variant = "pill",
}: {
  current: Locale;
  variant?: "pill" | "menu";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const switchTo = (l: Locale) => {
    // Max age one year — set-and-forget, matches the expected "remember my
    // language" behaviour for an international store.
    try {
      window.document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // noop: non-browser environments
    }
    router.refresh();
  };

  if (variant === "menu") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 border border-inverse-fg/30 px-3 py-2.5 text-center text-xs uppercase tracking-[0.16em] transition-colors hover:bg-inverse-fg hover:text-inverse"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Current language: ${current.toUpperCase()}`}
        >
          <span>{current.toUpperCase()}</span>
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <ul
              role="listbox"
              className="absolute bottom-full left-0 z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-lg border border-line bg-surface text-fg shadow-sm lg:bottom-auto lg:top-full"
            >
              {LOCALES.map((l) => {
                const active = l === current;
                return (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => switchTo(l)}
                      role="option"
                      aria-selected={active}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                        active ? "bg-fg text-bg" : "hover:bg-fg/10"
                      }`}
                    >
                      <span>{l.toUpperCase()}</span>
                      {active && (
                        <svg
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center rounded-full border border-line bg-surface px-1.5 py-0.5">
      {LOCALES.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-pressed={active}
            aria-label={l === "fr" ? "Passer en français" : "Switch to English"}
            className={`label-xs rounded-full px-2.5 py-1.5 transition-colors ${
              active ? "bg-fg text-bg" : "text-fg/70 hover:text-fg"
            }`}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
