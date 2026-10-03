"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AlertTriangleIcon } from "@/components/icons";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/en";

/** Must match `GRACE_COOKIE` in `src/lib/plan-constants.ts`. */
const GRACE_COOKIE = "rav3s_grace_until";
/** Must match `GRACE_WINDOW_MS` (3 hours). */
const WINDOW_MS = 3 * 60 * 60 * 1000;

/**
 * Reads the stored deadline, or null when there isn't a live one.
 *
 * Deliberately returns `null` rather than minting a new deadline: `getSnapshot`
 * runs on every render and must return a stable value, and a `Date.now()`-based
 * fallback would change on every call and spin React into an infinite re-render.
 */
function getStoredDeadline(): number | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${GRACE_COOKIE}=([^;]*)`),
  );
  if (!match) return null;

  const stored = Number(decodeURIComponent(match[1]));
  if (!Number.isFinite(stored) || stored <= Date.now()) return null;

  return stored;
}

/** The cookie does not change while the tab is open, so there is nothing to subscribe to. */
function subscribeToNothing() {
  return () => {};
}

function getServerDeadline(): null {
  return null;
}

/**
 * The one deadline for this browser, stable across reloads.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because the cookie
 * exists *outside* React and is already there on the first client render — an
 * effect would have to write state after the fact, which is both a render-phase
 * value arriving late and a lint error. The store gives us the server snapshot
 * for free, so hydration still matches on the first paint.
 *
 * The value is stored in a cookie rather than signed by the server because
 * `cookies().set` is not permitted while a Server Component renders. Nothing
 * security-relevant is decided from it — `plan-constants.ts` sets out exactly
 * what that does and does not buy.
 */
function useGraceDeadline(): number {
  const stored = useSyncExternalStore(
    subscribeToNothing,
    getStoredDeadline,
    getServerDeadline,
  );

  // The fallback for a browser with no live cookie. A lazy initialiser, not a
  // ref: it is read during render (which the hooks lint rightly forbids for
  // refs) but only ever computed once, so it stays stable without re-rendering.
  const [freshDeadline] = useState(() => Date.now() + WINDOW_MS);

  const deadline = stored ?? freshDeadline;

  useEffect(() => {
    // Persist it for 30 days — ten times the window — so a reload long before
    // the deadline still finds the original one rather than starting a new run.
    if (stored === null) {
      document.cookie = `${GRACE_COOKIE}=${freshDeadline}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
    }
  }, [stored, freshDeadline]);

  return deadline;
}

/**
 * The live countdown on the plan-expired screen.
 *
 * Hydration: the server already knows how much of the grace window was left
 * when it rendered, so that number arrives as a prop and is used as the initial
 * state. The first client render therefore produces exactly the markup the
 * server sent, and the clock only starts taking over inside `useEffect`. Seeding
 * it from `Date.now()` in a `useState` initialiser instead would mean reading
 * the clock during render, which differs between the server and the browser by
 * however long the response took to arrive — React would throw a mismatch on
 * the one element on the page that cannot afford to flicker.
 *
 * The countdown is recomputed as `deadlineMs - Date.now()` on every tick rather
 * than decremented, so a backgrounded tab, a throttled timer or a suspended
 * laptop catches up correctly instead of silently drifting.
 */

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function split(ms: number): Remaining {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function PlanCountdown({
  initialRemainingMs,
  windowMs,
  locale,
}: {
  /** What the server computed at render time — the hydration seed. */
  initialRemainingMs: number;
  /** Full length of the window, used for the progress bar. */
  windowMs: number;
  /** Plain data, so it is safe to cross the server -> client boundary. */
  locale: Locale;
}) {
  const [remaining, setRemaining] = useState(initialRemainingMs);
  const deadlineMs = useGraceDeadline();
  const t = makeTranslator(locale);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, deadlineMs - Date.now()));
    // Sync once immediately: the seed was computed on the server and time has
    // passed since, so the first painted second could otherwise be stale.
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  const { days, hours, minutes, seconds } = split(remaining);
  const elapsed = Math.min(windowMs, Math.max(0, windowMs - remaining));
  const progress = windowMs > 0 ? Math.round((elapsed / windowMs) * 100) : 0;
  const expired = remaining <= 0;

  // A day column only appears once the window is long enough to need one; a
  // permanent "00" above a three-hour countdown is just noise.
  const units: Array<{ value: number; label: TranslationKey }> = [
    ...(days > 0 ? [{ value: days, label: "plan.days" as const }] : []),
    { value: hours, label: "plan.hours" },
    { value: minutes, label: "plan.minutes" },
    { value: seconds, label: "plan.seconds" },
  ];

  return (
    <div>
      {/*
        Deliberately not `aria-live`. Announcing "two minutes fifty-nine
        seconds" once a second makes the page unusable with a screen reader, so
        the ticking digits are marked decorative and the absolute deadline is
        exposed once as text underneath.
      */}
      <div
        className="flex items-stretch justify-center gap-2.5 sm:gap-3"
        role="timer"
        aria-label={t("plan.timerAria")}
      >
        {units.map((unit) => (
          <span key={unit.label} className="countdown-cell">
            <span className="countdown-value" aria-hidden="true">
              {pad(unit.value)}
            </span>
            <span className="label-xs text-fg/55">{t(unit.label)}</span>
          </span>
        ))}
      </div>

      {/* How much of the window is gone, so the number has a shape. */}
      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-fg/10"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-alert transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-center text-xs text-fg/60">
        {expired ? t("plan.windowEnded") : t("plan.windowUsed", { percent: progress })}
      </p>

      <p className="sr-only">
        {expired
          ? t("plan.servicePaused")
          : t("plan.windowEndsAt", {
              when: new Date(deadlineMs).toLocaleString(locale),
            })}
      </p>
    </div>
  );
}

/**
 * The warning mark.
 *
 * Kept separate from `PlanCountdown` so the triangle can sit beside the title,
 * which is where a reader's eye lands first — not inside the number block,
 * where it would compete with the digits.
 */
export function AlertMark({ className }: { className?: string }) {
  return (
    <span
      className={`animate-alert-ring inline-flex items-center justify-center rounded-full bg-alert text-white ${
        className ?? "h-11 w-11"
      }`}
    >
      <AlertTriangleIcon className="h-6 w-6" />
    </span>
  );
}