"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import { shippingCentsFor } from "@/lib/cart";
import { BagIcon } from "@/components/icons";
import type { Locale, TranslationKey } from "@/lib/i18n/translate";
import { getDictionary, makeTranslator } from "@/lib/i18n/translate";
import { LOCALE_TAGS } from "@/lib/i18n/config";
import { pick } from "@/lib/localize";

type Method = "paypack" | "flutterwave" | "stripe";

const METHOD_COPY: Record<Method, { label: TranslationKey; hint: TranslationKey }> = {
  paypack: {
    label: "cart.method.paypack.label",
    hint: "cart.method.paypack.hint",
  },
  flutterwave: {
    label: "cart.method.flutterwave.label",
    hint: "cart.method.flutterwave.hint",
  },
  stripe: {
    label: "cart.method.stripe.label",
    hint: "cart.method.stripe.hint",
  },
};

/**
 * `/api/checkout` answers with a translation *key* rather than a sentence, so
 * the message can be shown in the visitor's own language. Anything that is not
 * a real key (an unexpected runtime message, say) passes through untouched.
 */
function localizeError(locale: Locale, raw: unknown): string | null {
  if (typeof raw !== "string" || raw === "") return null;
  const key = raw as TranslationKey;
  return key in getDictionary(locale) ? makeTranslator(locale)(key) : raw;
}

export function CartView({
  currency,
  flatShippingCents,
  freeShippingOverCents,
  methods,
  customer,
  locale,
}: {
  currency: string;
  flatShippingCents: number;
  freeShippingOverCents: number;
  methods: Method[];
  /** Prefills checkout and shows the "order history" reassurance. */
  customer: { name: string; email: string } | null;
  locale: Locale;
}) {
  const { lines, ready, subtotal, setQuantity, remove, clear } = useCart();
  const router = useRouter();
  const t = useMemo(() => makeTranslator(locale), [locale]);
  const tag = LOCALE_TAGS[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [method, setMethod] = useState<Method>(methods[0] ?? "paypack");
  // Seeded from the account so a returning shopper does not retype their details.
  const [fullName, setFullName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(customer?.email ?? "");

  const [waiting, setWaiting] = useState<{ ref: string; orderNumber: string; pollUrl: string } | null>(
    null
  );
  const [pollState, setPollState] = useState("");

  const shipping = shippingCentsFor(lines, flatShippingCents, freeShippingOverCents);
  const toFree = Math.max(0, freeShippingOverCents - subtotal);

  const needsPhone = method === "paypack";

  useEffect(() => {
    if (!waiting) return;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(waiting.pollUrl, { cache: "no-store" });
        const data = await res.json();
        if (stopped) return;
        if (res.ok && data.status === "PAID") {
          clear();
          router.replace(`/checkout/success?order=${waiting.orderNumber}&method=paypack`);
          return;
        }
        setPollState(t("cart.waitingApprove"));
      } catch {
        /* keep polling — the phone approval may not have landed yet */
      }
    };
    void tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [waiting, clear, router, t]);

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          ...(needsPhone ? { phone } : {}),
          ...(email ? { email } : {}),
          ...(fullName ? { fullName } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(localizeError(locale, data.error) ?? t("cart.errStart"));

      if (data.method === "paypack") {
        setWaiting({ ref: data.ref, orderNumber: data.orderNumber, pollUrl: data.pollUrl });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(t("cart.errNoLink"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cart.errGeneric"));
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="mt-10 h-40 animate-pulse rounded-[var(--radius-card)] bg-surface" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center border border-dashed border-line px-6 py-24 text-center">
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface-2"
        >
          <BagIcon className="h-7 w-7 text-haze" />
        </span>
        <p className="mt-5 font-display text-xl uppercase">{t("cart.empty")}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fg/70">
          {t("cart.emptyBody")}
        </p>
        <Link href="/shop" className="btn btn-primary mt-7">
          {t("cart.startShopping")}
        </Link>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-[var(--radius-card)] border border-line p-8 text-center">
        <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-line border-t-fg" />
        <h2 className="mt-6 text-2xl font-black uppercase">{t("cart.approveTitle")}</h2>
        <p className="mt-3 text-sm text-fg/70">{pollState || t("cart.checkPhone")}</p>
        <p className="mt-6 rounded-lg bg-surface-2 px-4 py-3 font-mono text-sm">
          {waiting.orderNumber}
        </p>
        <p className="mt-4 text-xs text-fg/65">{t("cart.selfUpdate")}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
      <div>
        <div className="hidden border-b border-line pb-3 text-xs text-fg/65 sm:grid sm:grid-cols-[1fr_7rem_7rem_2rem]">
          <span>{t("cart.productCol")}</span>
          <span className="text-center">{t("cart.quantityCol")}</span>
          <span className="text-right">{t("cart.totalCol")}</span>
          <span />
        </div>

        <ul>
          {lines.map((line) => (
            <li
              key={line.variantId}
              className="grid grid-cols-[5rem_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[6rem_1fr_7rem_7rem_2rem] sm:items-center"
            >
              <Link
                href={`/product/${line.slug}`}
                className="media-mat relative aspect-4/5 overflow-hidden rounded-lg border border-line"
              >
                <Image src={line.image} alt={line.name} fill sizes="6rem" className="media-fit" />
              </Link>

              <div className="min-w-0">
                <Link href={`/product/${line.slug}`} className="text-sm font-semibold hover:underline">
                  {line.name}
                </Link>
                <p className="mt-1.5 flex items-center gap-2 text-xs text-fg/70">
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-fg/15"
                    style={{ backgroundColor: line.colorHex }}
                  />
                  {pick(locale, line.colorFr, line.color)} / {line.size}
                </p>
                <p className="mt-1 text-xs text-fg/70 sm:hidden">
                  {t("cart.each", { amount: formatMoney(line.priceCents, currency, tag) })}
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.variantId)}
                  className="mt-2 text-xs text-fg/65 underline underline-offset-4 hover:text-fg"
                >
                  {t("cart.remove")}
                </button>
              </div>

              <div className="col-start-2 flex items-center sm:col-start-auto sm:justify-center">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                    className="h-9 w-9"
                    aria-label={t("cart.decreaseOf", { name: line.name })}
                  >
                    &minus;
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                    disabled={line.quantity >= line.stock}
                    className="h-9 w-9 disabled:opacity-60"
                    aria-label={t("cart.increaseOf", { name: line.name })}
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="hidden text-right text-sm font-semibold sm:block">
                {formatMoney(line.priceCents * line.quantity, currency, tag)}
              </p>

              <button
                type="button"
                onClick={() => remove(line.variantId)}
                className="hidden text-fg/70 transition-colors hover:text-fg sm:block"
                aria-label={t("cart.removeName", { name: line.name })}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/shop" className="label-xs text-fg/70 underline underline-offset-4 hover:text-fg">
            {t("cart.continueShopping")}
          </Link>
          <button
            type="button"
            onClick={clear}
            className="label-xs text-fg/70 underline underline-offset-4 hover:text-fg"
          >
            {t("cart.clearBag")}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <h2 className="label-xs text-fg/65">{t("cart.checkout")}</h2>

          {customer ? (
            <p className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-fg/75">
              <span className="min-w-0 truncate">
                {t("cart.payAs")} <span className="font-semibold">{customer.name}</span>
              </span>
              <Link
                href="/account"
                className="shrink-0 underline underline-offset-4 hover:text-fg"
              >
                {t("cart.change")}
              </Link>
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            <input
              className="field"
              placeholder={t("cart.fullName")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="field"
              placeholder={t("cart.phone")}
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={needsPhone}
              autoComplete="tel"
            />
            <input
              className={customer ? "field cursor-not-allowed opacity-70" : "field"}
              placeholder={customer ? t("cart.email") : t("cart.emailOptional")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              readOnly={Boolean(customer)}
            />
          </div>

          {!customer ? (
            <p className="mt-4 text-xs text-fg/70">
              {t("cart.haveAccount")}{" "}
              <Link
                href="/account/sign-in?next=%2Fcart"
                className="font-semibold text-fg underline underline-offset-4"
              >
                {t("account.signInButton")}
              </Link>{" "}
              {t("cart.signInFaster")}
            </p>
          ) : null}

          {methods.length > 0 ? (
            <fieldset className="mt-6">
              <legend className="label-xs text-fg/65">{t("cart.paymentMethod")}</legend>
              <div className="mt-3 space-y-2">
                {methods.map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                      method === m ? "border-fg bg-surface-2" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m}
                      checked={method === m}
                      onChange={() => setMethod(m)}
                      className="mt-1 accent-black"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{t(METHOD_COPY[m].label)}</span>
                      <span className="mt-0.5 block text-xs text-fg/70">
                        {t(METHOD_COPY[m].hint)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-line p-4 text-xs text-fg/70">
              {t("cart.onlineNotConfigured")}
            </p>
          )}

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg/70">{t("cart.subtotal")}</dt>
              <dd className="font-semibold">{formatMoney(subtotal, currency, tag)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg/70">{t("cart.delivery")}</dt>
              <dd className="font-semibold">
                {shipping === 0 ? t("cart.freeShipping") : formatMoney(shipping, currency, tag)}
              </dd>
            </div>
          </dl>

          {toFree > 0 ? (
            <>
              <div className="mt-4 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-1.5 rounded-full bg-fg transition-all"
                  style={{
                    width: `${Math.min(100, (subtotal / Math.max(1, freeShippingOverCents)) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-fg/70">
                {t("cart.awayFromFree", { amount: formatMoney(toFree, currency, tag) })}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-fg/70">{t("cart.unlockedFree")}</p>
          )}

          <div className="mt-5 flex justify-between border-t border-line pt-5">
            <span className="text-sm font-semibold">{t("cart.total")}</span>
            <span className="text-lg font-bold">{formatMoney(subtotal + shipping, currency, tag)}</span>
          </div>

          {methods.length > 0 ? (
            <button
              type="button"
              onClick={checkout}
              disabled={busy || (needsPhone && phone.replace(/\D/g, "").length < 9)}
              className="btn btn-primary mt-6 w-full"
            >
              {busy ? t("cart.startingPayment") : t("cart.payNow")}
            </button>
          ) : null}

          {error ? (
            <p className="mt-3 text-xs text-fg" role="alert">
              {error}
            </p>
          ) : null}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-fg/65">
            {t("cart.payNote")}
          </p>
        </div>
      </aside>
    </div>
  );
}
