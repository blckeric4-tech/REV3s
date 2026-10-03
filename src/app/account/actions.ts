"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { storeImage } from "@/lib/image-store";
import {
  claimGuestOrders,
  createCustomerSession,
  destroyCustomerSession,
  getCustomer,
  registerCustomer,
  verifyCustomerCredentials,
} from "@/lib/customer-auth";
import type { AuthState } from "./state";
import type { TranslationKey } from "@/lib/i18n/en";

export type { AuthState } from "./state";

/** Shorthand: an action almost always returns a bare message and nothing else. */
const fail = (messageKey: TranslationKey, next?: string): AuthState => ({
  ok: false,
  messageKey,
  next,
});

/** Only ever redirect to a path on this site — never to an absolute URL. */
function safeNext(raw: FormDataEntryValue | null, fallback: string) {
  const value = typeof raw === "string" ? raw : "";
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function customerSignUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const next = safeNext(formData.get("next"), "/account");

  const errors: Record<string, TranslationKey> = {};
  if (!name.trim()) errors.name = "error.enterName";
  if (!email.trim()) errors.email = "error.enterEmail";
  if (!password) errors.password = "error.choosePassword";
  if (password && confirm !== password) errors.confirm = "error.passwordMismatch";
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      messageKey: "error.fixFields",
      errors,
      next,
    };
  }

  let result;
  try {
    result = await registerCustomer(name, email, password);
  } catch {
    return fail("error.createAccountFailed", next);
  }
  if ("errorKey" in result) {
    return {
      ok: false,
      messageKey: result.errorKey,
      values: result.errorValues,
      next,
    };
  }

  await createCustomerSession(result.customer);
  await claimGuestOrders(result.customer.id, result.customer.email);

  redirect(next);
}

export async function customerSignIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/account");

  if (!email.trim() || !password) {
    return fail("error.emailAndPassword", next);
  }

  const customer = await verifyCustomerCredentials(email, password);
  if (!customer) {
    return fail("error.badCredentials", next);
  }

  await createCustomerSession(customer);
  await claimGuestOrders(customer.id, customer.email);

  redirect(next);
}

export async function customerSignOut() {
  const wasSignedIn = Boolean(await getCustomer());
  await destroyCustomerSession();
  if (wasSignedIn) revalidatePath("/", "layout");
  redirect("/");
}

export async function customerUpdateName(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const customer = await getCustomer();
  if (!customer) return fail("error.signInAgain");

  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    return {
      ok: false,
      messageKey: "error.fixFields",
      errors: { name: "error.enterName" },
    };
  }

  await db.customer.update({ where: { id: customer.id }, data: { name } });

  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { ok: true, messageKey: "success.detailsSaved" };
}

/* ── Profile photo ──────────────────────────────────────────────────── */

/** Avatars are small; a tight ceiling stops someone uploading a 6 MB photo. */
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Rejects anything that is not really an image, whatever the browser claimed in
 * its Content-Type header. Without this, a renamed .html or .svg could be
 * stored under /uploads and later served back from the site's own origin.
 */
function sniffImage(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "png";
  }
  if (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (bytes.subarray(4, 8).toString("ascii") === "ftyp") return "avif";
  return null;
}

export async function customerUpdateAvatar(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const customer = await getCustomer();
  if (!customer) return fail("error.signInAgain");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return fail("error.choosePhoto");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (bytes.length > MAX_AVATAR_BYTES) {
    return fail("error.photoTooLarge");
  }

  const sniffed = sniffImage(bytes);
  if (!sniffed || !AVATAR_TYPES[file.type]) {
    return fail("error.photoType");
  }

  try {
    const url = await storeImage(bytes, sniffed);
    await db.customer.update({ where: { id: customer.id }, data: { avatarUrl: url } });
  } catch {
    return fail("error.photoSaveFailed");
  }

  revalidatePath("/", "layout");
  revalidatePath("/account", "layout");
  return { ok: true, messageKey: "success.photoUpdated" };
}

/**
 * Removes the photo. Declares no parameters — `useActionState` passes
 * `(prevState, formData)` positionally and neither is needed here.
 */
export async function customerRemoveAvatar(): Promise<AuthState> {
  const customer = await getCustomer();
  if (!customer) return fail("error.signInAgain");

  await db.customer.update({ where: { id: customer.id }, data: { avatarUrl: null } });

  revalidatePath("/", "layout");
  revalidatePath("/account", "layout");
  return { ok: true, messageKey: "success.photoRemoved" };
}