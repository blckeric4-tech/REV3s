import "server-only";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";

const COOKIE = "rav3s_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "rav3s-dev-secret";
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

export function verifyCredentials(email: string, password: string) {
  return db.$transaction(async (tx) => {
    const user = await tx.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // constant-ish work to avoid leaking whether the email exists
      await tx.adminUser.findFirst();
      return null;
    }
    const ok = await import("bcryptjs").then((m) => m.default.compare(password, user.passwordHash));
    return ok ? user : null;
  });
}

export async function createSession(userId: string) {
  const payload = `${userId}.${Date.now()}.${randomBytes(8).toString("hex")}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, issued, nonce, sig] = parts;
  const payload = `${userId}.${issued}.${nonce}`;
  if (!safeEqual(sign(payload), sig)) return null;

  if (Date.now() - Number(issued) > MAX_AGE * 1000) return null;
  return db.adminUser.findUnique({ where: { id: userId } });
}

/** For pages/layouts. Redirects to the login screen when not signed in. */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For server actions. Throws instead of redirecting. */
export async function assertAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
