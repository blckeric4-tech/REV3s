"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "rav3s-theme";
type Theme = "light" | "dark";

/**
 * Runs before paint to apply the stored theme, so a dark-mode visitor never sees
 * a white flash. Kept as a raw string in the layout head.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Read the theme straight from the DOM class the init script already set. */
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const observer = new MutationObserver(emit);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    listeners.delete(onChange);
    observer.disconnect();
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Server and first client render always agree on light; the script corrects it. */
const getServerSnapshot = (): Theme => "light";

export function ThemeToggle({
  variant = "icon",
  className = "",
}: {
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  const toggle = useCallback(() => {
    const next: Theme = isDark ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the theme just won't persist */
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    emit();
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        variant === "labelled"
          ? `btn btn-outline h-9 px-4 ${className}`
          : `inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition-colors hover:bg-fg hover:text-bg ${className}`
      }
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 14a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm8-7a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM7 12a1 1 0 0 1-1 1H5a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm10.66-5.66a1 1 0 0 1 0 1.41l-.7.71a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 0ZM8.46 15.54a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.42l.7-.7a1 1 0 0 1 1.42 0Zm9.19 2.12a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 1 1 1.42-1.41l.7.7a1 1 0 0 1 0 1.42ZM8.46 8.46a1 1 0 0 1-1.42 0l-.7-.71a1 1 0 0 1 1.41-1.41l.71.7a1 1 0 0 1 0 1.42Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14.11 14.11 1 1 0 0 0-.47-1.47ZM9.25 21.5A8.5 8.5 0 0 1 3.4 15.06a9 9 0 0 0 5.13 5.12A8.46 8.46 0 0 1 9.25 21.5Z" />
        </svg>
      )}
      {variant === "labelled" ? (
        <span className="ml-2">{isDark ? "Light" : "Dark"}</span>
      ) : null}
    </button>
  );
}
