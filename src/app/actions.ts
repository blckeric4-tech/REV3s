"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

const schema = z.string().trim().email("Please enter a valid email address.");

export type SubscribeState = { ok: boolean; message: string };

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const parsed = schema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const email = parsed.data.toLowerCase();

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  } catch {
    return { ok: false, message: "Could not save your email. Please try again." };
  }

  revalidatePath("/admin/settings");
  return { ok: true, message: "You're on the list. Check your inbox." };
}
