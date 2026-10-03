/**
 * Shared state for the account forms.
 *
 * This lives outside `actions.ts` on purpose: a `"use server"` module may only
 * export async functions, so exporting the initial state object from there
 * breaks the build.
 *
 * Messages are **translation keys**, not sentences. React cannot serialise a
 * function from a Server Action into a Client Component, so an action cannot
 * hand back `t(...)`. Returning the key lets the client render the reply in
 * whichever language is on screen right now — including one the shopper has
 * switched to since the page loaded.
 */

import type { TranslationKey } from "@/lib/i18n/en";

export type AuthState = {
  ok: boolean;
  /** Null until the action has something to say. */
  messageKey: TranslationKey | null;
  /** Interpolation values for `messageKey`, e.g. `{ min: 10 }`. */
  values?: Record<string, string | number>;
  /** Per-field messages, keyed by input name. */
  errors?: Record<string, TranslationKey>;
  /** Set when the shopper came from a protected page and should go back there. */
  next?: string;
};

export const initialAuthState: AuthState = { ok: false, messageKey: null };