"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import type { TranslationKey } from "@/lib/i18n/en";

const schema = z.string().trim().email();

/**
 * A Server Action cannot hand a translate function to the client, so the
 * action returns a message *key* and `NewsletterForm` renders it with the
 * locale already on hand. That keeps the reply in the language the customer
 * is actually reading, even if they switch language mid-session.
 */
export type SubscribeState = { ok: boolean; messageKey: TranslationKey | null };

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const parsed = schema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, messageKey: "newsletter.invalidEmail" };
  }

  const email = parsed.data.toLowerCase();

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  } catch {
    return { ok: false, messageKey: "newsletter.saveFailed" };
  }

  revalidatePath("/admin/settings");
  return { ok: true, messageKey: "newsletter.onList" };
}