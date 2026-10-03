/**
 * Shared types for the admin Server Actions.
 *
 * A `"use server"` module may only export async functions, so the state shape
 * has to live in a plain module next door.
 *
 * Messages are **translation keys**, not sentences. React cannot serialise a
 * function across the server -> client boundary, so an action cannot hand back
 * `t(...)`; it returns the key and the client renders it with its own
 * translator. That also means an error posted in one language renders in the
 * admin's current language rather than whatever the cookie said at submit time.
 *
 * Zod's `message` is used to carry the key itself. It is never shown to anyone
 * untranslated — the action copies `issue.message` into `errors` and the form
 * runs it through `t`.
 */

import type { TranslationKey } from "@/lib/i18n/en";

export type ActionState = {
  ok: boolean;
  /** Null until the action has something to say. */
  messageKey: TranslationKey | null;
  /** Interpolation values for `messageKey`, e.g. `{ min: 10 }`. */
  values?: Record<string, string | number>;
  /** Per-field messages, keyed by form field name. */
  errors?: Record<string, TranslationKey>;
};

export const initialActionState: ActionState = { ok: false, messageKey: null };

/** Narrows an untyped zod message back to a key we actually declared. */
export function asKey(message: string): TranslationKey {
  return message as TranslationKey;
}