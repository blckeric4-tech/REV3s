import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { CUSTOMER_COOKIE, CUSTOMER_PASSWORD_MIN } from "@/lib/customer-auth-constants";

/**
 * Customer (shopper) sessions.
 *
 * Deliberately separate from the admin session in `lib/auth.ts`: a different
 * cookie name, a different guard helper, and a different table. A signed-in
 * shopper can never reach `/admin`, and a signed-in admin is never treated as a
 * customer on the storefront.
 */

export { CUSTOMER_COOKIE, CUSTOMER_PASSWORD_MIN };

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Password rules. Deliberately not stricter than the admin rule: long
 * passphrases are fine, and we never reject a shopper for using a symbol their
 * keyboard layout makes hard to type.
 */
export function validatePassword(password: string): string | null {
  if (password.length < CUSTOMER_PASSWORD_MIN) {
    return `Use at least ${CUSTOMER_PASSWORD_MIN} characters.`;
  }
  if (!/[a-zA-Z]/.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}

export type CustomerSession = {
  id: string;
  email: string;
  name: string;
  /** Profile photo path under /uploads, or null to fall back to initials. */
  avatarUrl: string | null;
};

/** Signs a session cookie for an already-authenticated customer row. */
export async function createCustomerSession(customer: {
  id: string;
  email: string;
  name: string;
}) {
  const payload = `${customer.id}.${Date.now()}.${randomBytes(8).toString("hex")}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
}

/**
 * Resolves the signed-in customer, or null. Safe to call from layouts, pages and
 * route handlers. Re-checks the signature and the expiry, then confirms the row
 * still exists so a deleted account cannot keep browsing as a ghost.
 */
export async function getCustomer(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, issued, nonce, sig] = parts;
  const payload = `${userId}.${issued}.${nonce}`;
  if (!safeEqual(sign(payload), sig)) return null;
  if (Date.now() - Number(issued) > MAX_AGE * 1000) return null;

const user = await db.customer.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });
  return user;
}

/** For pages. Redirects to the sign-in screen, remembering where they were. */
export async function requireCustomer(nextPath = "/account"): Promise<CustomerSession> {
  const user = await getCustomer();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/**
 * Creates a customer. Returns the row, or an error message if the email is
 * already taken — the caller decides how to phrase that to the shopper.
 */
export async function registerCustomer(
  name: string,
  email: string,
  password: string
): Promise<{ customer: CustomerSession } | { error: string }> {
  const cleanEmail = normalizeEmail(email);
  const cleanName = name.trim().replace(/\s+/g, " ");

  if (cleanName.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return { error: "Please enter a valid email address." };
  }
  const passwordProblem = validatePassword(password);
  if (passwordProblem) return { error: passwordProblem };

  const existing = await db.customer.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return { error: "An account already uses that email. Try signing in instead." };
  }

  const created = await db.customer.create({
    data: {
      email: cleanEmail,
      name: cleanName,
      passwordHash: await bcrypt.hash(password, 12),
    },
select: { id: true, email: true, name: true, avatarUrl: true },
  });

  return { customer: created };
}

/**
 * Verifies an email + password pair. Always does the same amount of bcrypt work
 * whether or not the email exists, so the response time does not reveal which
 * addresses are registered.
 */
export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<CustomerSession | null> {
  const cleanEmail = normalizeEmail(email);
  const user = await db.customer.findUnique({
    where: { email: cleanEmail },
    select: { id: true, email: true, name: true, passwordHash: true, avatarUrl: true },
  });

  if (!user) {
    // Burn an equivalent hash so a missing account is not faster than a wrong
    // password.
    await bcrypt.compare(password, "$2b$12$abcdefghijklmnopqrstuv0123456789012345678901234567890");
    return null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok
    ? { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }
    : null;
}

/** Moves any guest orders onto the account after a successful sign-in. */
export async function claimGuestOrders(customerId: string, email: string) {
  await db.order
    .updateMany({
      where: { customerId: null, email: normalizeEmail(email) },
      data: { customerId },
    })
    .catch(() => undefined);
}
