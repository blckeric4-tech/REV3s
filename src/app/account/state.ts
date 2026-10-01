/**
 * Shared state for the account forms.
 *
 * This lives outside `actions.ts` on purpose: a `"use server"` module may only
 * export async functions, so exporting the initial state object from there
 * breaks the build.
 */

export type AuthState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** Set when the shopper came from a protected page and should go back there. */
  next?: string;
};

export const initialAuthState: AuthState = { ok: false, message: "" };
