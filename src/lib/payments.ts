/**
 * Rwandan / African payment gateways, ported from the bagabo coffee-shop app.
 *
 *  • PayPack    (paypack.rw) — MTN MoMo, Airtel Money, Tigo Cash.
 *                A "cashin" request pushes a prompt to the customer's phone;
 *                we confirm by polling the events endpoint.
 *  • Flutterwave v4         — cards, MTN MoMo and Airtel Money.
 *  • Stripe                  — kept as the international card fallback.
 */

const PAYPACK_BASE = "https://payments.paypack.rw/api/";

export const paypackConfig = {
  clientId: process.env.PAYPACK_CLIENT_ID || "",
  clientSecret: process.env.PAYPACK_CLIENT_SECRET || "",
  webhookSecret: process.env.PAYPACK_WEBHOOK_SECRET || "",
  mode: process.env.PAYPACK_MODE === "production" ? "production" : "development",
};

export const flutterwaveConfig = {
  clientId: process.env.FLW_CLIENT_ID || "",
  clientSecret: process.env.FLW_CLIENT_SECRET || "",
  encryptionKey: process.env.FLW_ENCRYPTION_KEY || "",
  webhookSecret: process.env.FLW_WEBHOOK_SECRET || "",
  env: process.env.FLW_ENV === "live" ? "live" : "test",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function paypackConfigured() {
  return Boolean(paypackConfig.clientId && paypackConfig.clientSecret);
}

export function flutterwaveConfigured() {
  return Boolean(flutterwaveConfig.clientId && flutterwaveConfig.clientSecret);
}

export type PaymentMethod = "paypack" | "flutterwave" | "stripe";

/** Which methods the checkout page should offer, given what's configured. */
export function availableMethods(): PaymentMethod[] {
  const out: PaymentMethod[] = [];
  if (paypackConfigured()) out.push("paypack");
  if (flutterwaveConfigured()) out.push("flutterwave");
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("replace_me")) {
    out.push("stripe");
  }
  return out;
}

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  paypack: "MTN MoMo / Airtel Money",
  flutterwave: "Card / Mobile Money",
  stripe: "International card",
};

// ─── PayPack ───────────────────────────────────────────────

let paypackToken: { token: string; exp: number } | null = null;

async function paypackTokenGet(): Promise<string> {
  if (paypackToken && paypackToken.exp > Date.now() + 60_000) return paypackToken.token;

  const res = await fetch(PAYPACK_BASE + "auth/agents/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: paypackConfig.clientId,
      client_secret: paypackConfig.clientSecret,
    }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}) as Record<string, unknown>);
  const access = (json as { access?: string }).access;
  if (!res.ok || !access) throw new Error("Payment service: could not get a Paypack token.");

  paypackToken = { token: access, exp: Date.now() + 14 * 60_000 };
  return access;
}

async function paypackCall(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
  idempotencyKey?: string
) {
  const token = await paypackTokenGet();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Webhook-Mode": paypackConfig.mode,
  };
  if (body) headers["Idempotency-Key"] = String(idempotencyKey ?? crypto.randomUUID()).slice(0, 32);

  const res = await fetch(PAYPACK_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (!res.ok) {
    const e = (json as { error?: { message?: string } | string }).error;
    const msg =
      (typeof e === "string" ? e : e?.message) ??
      (json as { message?: string; detail?: string }).message ??
      (json as { detail?: string }).detail ??
      `HTTP ${res.status}`;
    throw new Error(`Payment service: ${msg}`);
  }
  return json as Record<string, unknown>;
}

/** "+250788123456" / "788123456" -> "0788123456" */
export function rwNumber(phone: string) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("250")) d = d.slice(3);
  if (!d.startsWith("0")) d = "0" + d;
  return d;
}

/**
 * Push a payment prompt to the customer's phone. Returns the Paypack record
 * including its `ref`, which the order is then matched against.
 */
export async function paypackCashin({
  amount,
  phone,
  idempotencyKey,
}: {
  amount: number;
  phone: string;
  idempotencyKey?: string;
}) {
  const j = await paypackCall(
    "transactions/cashin",
    "POST",
    { amount: Math.max(1, Math.round(Number(amount))), number: rwNumber(phone) },
    idempotencyKey
  );
  const ref = (j as { ref?: string }).ref;
  if (!ref) throw new Error("Payment service: Paypack did not return a reference.");
  return { ...j, ref };
}

/**
 * Look up a transaction. Paypack's find endpoint omits `status`, so we also
 * read the events endpoint and attach the latest status to the record.
 */
export async function paypackFind(ref: string) {
  const t = await paypackCall(`transactions/find/${encodeURIComponent(ref)}`, "GET");
  try {
    const ev = await paypackCall(
      `events/transactions?ref=${encodeURIComponent(ref)}`,
      "GET"
    );
    const list = (ev as { transactions?: unknown[] }).transactions ?? [];
    const latest = (list[0] as { data?: { status?: string } } | undefined)?.data;
    const status = (ev as { status?: string }).status ?? latest?.status;
    if (status) (t as Record<string, unknown>).status = status;
  } catch {
    // The find response is still usable without a status.
  }
  return t as Record<string, unknown> & { status?: string };
}

export function paypackIsPaid(record: { status?: string }) {
  return String(record?.status || "").toLowerCase() === "successful";
}

/** Verify the x-paypack-signature header (base64 HMAC-SHA256 of the raw body). */
export async function paypackVerifySignature(raw: string, signature: string | null) {
  if (!paypackConfig.webhookSecret) return true; // unenforced until a secret is set
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(paypackConfig.webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── Flutterwave ───────────────────────────────────────────

export async function flutterwaveInitialize({
  txRef,
  amount,
  email,
  phone,
  redirectUrl,
}: {
  txRef: string;
  amount: number;
  email: string;
  phone?: string;
  redirectUrl?: string;
}) {
  const res = await fetch("https://api.flutterwave.com/v4/payments/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${flutterwaveConfig.clientSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: Math.max(1, Math.round(Number(amount))),
      currency: "RWF",
      redirect_url: redirectUrl ?? `${flutterwaveConfig.baseUrl}/checkout/success`,
      customer: {
        email,
        ...(phone ? { phonenumber: rwNumber(phone) } : {}),
      },
      customizations: {
        title: "RAV3S",
        description: "Order payment",
        logo: `${flutterwaveConfig.baseUrl}/logo.png`,
      },
      ...(flutterwaveConfig.env === "live" ? {} : { meta: { sandbox_mode: "true" } }),
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };
  if (!res.ok || json.status !== "success" || !json.data?.link) {
    throw new Error(`Payment service: ${json.message || "Flutterwave declined the request."}`);
  }
  return json.data.link as string;
}

/** Confirm a Flutterwave transaction by its tx_ref. */
export async function flutterwaveVerify(txRef: string) {
  const url = `https://api.flutterwave.com/v4/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${flutterwaveConfig.clientSecret}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: { status?: string };
  };
  if (!res.ok || json.status !== "success") {
    throw new Error(`Payment service: ${json.message || "could not verify the transaction."}`);
  }
  return { paid: String(json.data?.status).toLowerCase() === "successful" };
}

export async function flutterwaveVerifyWebhook(secret: string | null, rawBody: string) {
  if (!flutterwaveConfig.webhookSecret) return true;
  if (!secret) return false;

  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${flutterwaveConfig.webhookSecret}${rawBody}`)
  );
  const expected = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(expected, secret);
}
