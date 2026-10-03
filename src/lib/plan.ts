import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  GRACE_COOKIE,
  GRACE_WINDOW_MS,
  billingUrl,
  decodeDeadline,
  priceRwf,
} from "./plan-constants";

/**
 * Server-side reader for the plan-expired screen.
 *
 * This module only *reads*. The deadline cookie is written by `proxy.ts`,
 * because `cookies().set` is not permitted while a Server Component is
 * rendering — the response headers have already started streaming by then.
 */

/**
 * How the countdown on the plan screen must behave, resolved once per request.
 *
 * `deadlineMs` is absolute so the client never has to trust its own clock: a
 * visitor who changes their device time sees the same number as everyone else.
 * `remainingMs` is what the server computed at render time — the client seeds
 * its first paint with this value, which is what keeps hydration from
 * mismatching on a page whose whole purpose is a ticking number.
 */
export type GraceWindow = {
  /** Absolute deadline, ms since the epoch. */
  deadlineMs: number;
  /** What was left when the server rendered this. */
  remainingMs: number;
  /** Full length of the window, for the progress bar. */
  windowMs: number;
  priceRwf: number;
  billingUrl: string;
};

export const getGraceWindow = cache(async (): Promise<GraceWindow> => {
  const store = await cookies();
  const deadline =
    decodeDeadline(store.get(GRACE_COOKIE)?.value) ?? Date.now() + GRACE_WINDOW_MS;

  return {
    deadlineMs: deadline,
    remainingMs: Math.max(0, deadline - Date.now()),
    windowMs: GRACE_WINDOW_MS,
    priceRwf: priceRwf(),
    billingUrl: billingUrl(),
  };
});