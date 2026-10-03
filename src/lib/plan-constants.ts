import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Plan / billing constants, shared by `proxy.ts` and `src/lib/plan.ts`.
 *
 * Kept separate from `plan.ts` for the same reason `customer-auth-constants.ts`
 * exists: `plan.ts` starts with `import "server-only"`, which the edge runtime
 * running the proxy cannot pull in. Anything the proxy needs has to live here.
 *
 * Nothing in this file is a security boundary. It decides what the countdown on
 * the plan-expired screen *claims*; whether a workspace is actually suspended is
 * a separate, server-side check made against the database before any privileged
 * action is allowed. Keeping those two apart means a visitor who edits the
 * cookie can move the number on the screen, and nothing else.
 */

/** How long a lapsed free plan keeps serving before it is paused. */
export const GRACE_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours

/** Cookie holding the signed deadline. Read by the page, written by the proxy. */
export const GRACE_COOKIE = "rav3s_grace_until";

/** The route that shows the countdown and the upgrade button. */
export const PLAN_ROUTE = "/plan-expired";

/** What the paid plan costs, in Rwandan francs. */
export const PLAN_PRICE_RWF = 10_000;

/** Where the upgrade button goes. Override per environment. */
export const DEFAULT_BILLING_URL = "https://dashboard.render.com/billing";

export function billingUrl() {
  return process.env.PLAN_BILLING_URL || DEFAULT_BILLING_URL;
}

export function priceRwf() {
  const raw = Number(process.env.PLAN_PRICE_RWF);
  return Number.isFinite(raw) && raw > 0 ? raw : PLAN_PRICE_RWF;
}

/**
 * The same signing secret the sessions use, so there is one rotation story for
 * the whole app: change `SESSION_SECRET` and every signed cookie in the system
 * is invalidated at once.
 */
function secret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "rav3s-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

/** `${deadlineMs}.${signature}` */
export function encodeDeadline(deadlineMs: number) {
  const payload = String(deadlineMs);
  return `${payload}.${sign(payload)}`;
}

/**
 * Reads a deadline from a cookie value.
 *
 * Two accepted shapes:
 *
 *   `${deadlineMs}.${signature}` — written by the server, HMAC-signed with the
 *   session secret. This is the trusted shape.
 *
 *   `${deadlineMs}` — written by the browser on the client's first visit (see
 *   `plan-countdown.tsx`). Unverifiable by definition, because the only party
 *   that can sign it is the server and the browser cannot ask for a signature
 *   during render.
 *
 * The unsigned shape is accepted only because nothing here is a security
 * boundary — this value decides what the countdown *says*, not whether a
 * workspace is suspended. Anything that actually gates access has to re-check
 * the subscription against the database. If you ever find yourself trusting
 * this for a real decision, delete the fallback and set the cookie from a Route
 * Handler instead.
 */
export function decodeDeadline(token: string | undefined): number | null {
  if (!token) return null;

  const cut = token.lastIndexOf(".");
  const deadline = Number(cut > 0 ? token.slice(0, cut) : token);
  if (!Number.isFinite(deadline) || deadline <= 0) return null;

  if (cut > 0) {
    const signature = token.slice(cut + 1);
    const expected = sign(token.slice(0, cut));

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  }

  // An elapsed deadline is treated as absent so a fresh window is minted.
  return deadline > Date.now() ? deadline : null;
}