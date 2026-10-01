"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import { shippingCentsFor } from "@/lib/cart";
import { BagIcon } from "@/components/icons";

type Method = "paypack" | "flutterwave" | "stripe";

const METHOD_COPY: Record<Method, { label: string; hint: string }> = {
  paypack: {
    label: "MTN MoMo / Airtel Money",
    hint: "We push a prompt to your phone. Approve it to pay.",
  },
  flutterwave: {
    label: "Card / Mobile Money",
    hint: "Visa, Mastercard or mobile money via Flutterwave.",
  },
  stripe: {
    label: "International card",
    hint: "Apple Pay, Google Pay and cards worldwide.",
  },
};

export function CartView({
  currency,
  flatShippingCents,
  freeShippingOverCents,
  methods,
  customer,
}: {
  currency: string;
  flatShippingCents: number;
  freeShippingOverCents: number;
  methods: Method[];
  /** Prefills checkout and shows the "order history" reassurance. */
  customer: { name: string; email: string } | null;
}) {
  const { lines, ready, subtotal, setQuantity, remove, clear } = useCart();
  const router = useRouter();
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
  const [pollState, setPollState] = useState("Check your phone and approve the payment.");

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
        setPollState(
          String(data.status || "").toUpperCase() === "PENDING"
            ? "Waiting for you to approve on your phone..."
            : "Waiting for you to approve on your phone..."
        );
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
  }, [waiting, clear, router]);

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
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");

      if (data.method === "paypack") {
        setWaiting({ ref: data.ref, orderNumber: data.orderNumber, pollUrl: data.pollUrl });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("The payment service did not return a link.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
        <p className="mt-5 font-display text-xl uppercase">Your bag is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fg/70">
          Nothing in here yet. Have a look at the new drop.
        </p>
        <Link href="/shop" className="btn btn-primary mt-7">
          Start shopping
        </Link>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-[var(--radius-card)] border border-line p-8 text-center">
        <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-line border-t-fg" />
        <h2 className="mt-6 text-2xl font-black uppercase">Approve your payment</h2>
        <p className="mt-3 text-sm text-fg/70">{pollState}</p>
        <p className="mt-6 rounded-lg bg-surface-2 px-4 py-3 font-mono text-sm">
          {waiting.orderNumber}
        </p>
        <p className="mt-4 text-xs text-fg/65">
          This page updates by itself as soon as the payment lands.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-16">
      <div>
        <div className="hidden border-b border-line pb-3 text-xs text-fg/65 sm:grid sm:grid-cols-[1fr_7rem_7rem_2rem]">
          <span>Product</span>
          <span className="text-center">Quantity</span>
          <span className="text-right">Total</span>
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
                  {line.color} / {line.size}
                </p>
                <p className="mt-1 text-xs text-fg/70 sm:hidden">
                  {formatMoney(line.priceCents, currency)} each
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.variantId)}
                  className="mt-2 text-xs text-fg/65 underline underline-offset-4 hover:text-fg"
                >
                  Remove
                </button>
              </div>

              <div className="col-start-2 flex items-center sm:col-start-auto sm:justify-center">
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                    className="h-9 w-9"
                    aria-label={`Decrease quantity of ${line.name}`}
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
                    aria-label={`Increase quantity of ${line.name}`}
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="hidden text-right text-sm font-semibold sm:block">
                {formatMoney(line.priceCents * line.quantity, currency)}
              </p>

              <button
                type="button"
                onClick={() => remove(line.variantId)}
                className="hidden text-fg/70 transition-colors hover:text-fg sm:block"
                aria-label={`Remove ${line.name}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/shop" className="label-xs text-fg/70 underline underline-offset-4 hover:text-fg">
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="label-xs text-fg/70 underline underline-offset-4 hover:text-fg"
          >
            Clear bag
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-6">
          <h2 className="label-xs text-fg/65">Checkout</h2>

          {customer ? (
            <p className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-fg/75">
              <span className="min-w-0 truncate">
                Paying as <span className="font-semibold">{customer.name}</span>
              </span>
              <Link
                href="/account"
                className="shrink-0 underline underline-offset-4 hover:text-fg"
              >
                Change
              </Link>
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            <input
              className="field"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="field"
              placeholder="Phone (0788 000 000)"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={needsPhone}
              autoComplete="tel"
            />
            <input
              className={customer ? "field cursor-not-allowed opacity-70" : "field"}
              placeholder={customer ? "Email" : "Email (optional)"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              readOnly={Boolean(customer)}
            />
          </div>

          {!customer ? (
            <p className="mt-4 text-xs text-fg/70">
              Have an account?{" "}
              <Link
                href="/account/sign-in?next=%2Fcart"
                className="font-semibold text-fg underline underline-offset-4"
              >
                Sign in
              </Link>{" "}
              to check out faster and keep your order history.
            </p>
          ) : null}

          {methods.length > 0 ? (
            <fieldset className="mt-6">
              <legend className="label-xs text-fg/65">Payment method</legend>
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
                      <span className="block text-sm font-semibold">{METHOD_COPY[m].label}</span>
                      <span className="mt-0.5 block text-xs text-fg/70">{METHOD_COPY[m].hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-line p-4 text-xs text-fg/70">
              Online payment is not configured yet. Please order on WhatsApp and we will sort
              the details out with you.
            </p>
          )}

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg/70">Subtotal</dt>
              <dd className="font-semibold">{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg/70">Delivery</dt>
              <dd className="font-semibold">
                {shipping === 0 ? "Free" : formatMoney(shipping, currency)}
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
                {formatMoney(toFree, currency)} away from free delivery
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-fg/70">You have unlocked free delivery</p>
          )}

          <div className="mt-5 flex justify-between border-t border-line pt-5">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold">{formatMoney(subtotal + shipping, currency)}</span>
          </div>

          {methods.length > 0 ? (
            <button
              type="button"
              onClick={checkout}
              disabled={busy || (needsPhone && phone.replace(/\D/g, "").length < 9)}
              className="btn btn-primary mt-6 w-full"
            >
              {busy ? "Starting payment..." : "Pay now"}
            </button>
          ) : null}

          {error ? (
            <p className="mt-3 text-xs text-fg" role="alert">
              {error}
            </p>
          ) : null}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-fg/65">
            Pay with MTN MoMo, Airtel Money, Tigo Cash or an international card.
          </p>
        </div>
      </aside>
    </div>
  );
}
