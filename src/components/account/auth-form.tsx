"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { customerSignIn, customerSignUp } from "@/app/account/actions";
import { initialAuthState } from "@/app/account/state";
import { CUSTOMER_PASSWORD_MIN } from "@/lib/customer-auth-constants";

type Mode = "sign-in" | "sign-up";

const COPY: Record<Mode, { kicker: string; title: string; body: string; cta: string; pending: string }> = {
  "sign-in": {
    kicker: "Welcome back",
    title: "Sign in",
    body: "Sign in to follow your orders and check out in one tap.",
    cta: "Sign in",
    pending: "Signing in…",
  },
  "sign-up": {
    kicker: "Create an account",
    title: "Join RAV3S",
    body: `One account for your orders, your delivery details and first access to every drop. Minimum ${CUSTOMER_PASSWORD_MIN} characters.`,
    cta: "Create account",
    pending: "Creating account…",
  },
};

const PERKS: Record<Mode, string[]> = {
  "sign-in": [
    "Every order in one place, with live status",
    "Your details saved — no retyping at checkout",
    "Checkout that takes one tap",
  ],
  "sign-up": [
    "Track every order from payment to delivery",
    "Saved details for a one-tap checkout",
    "First access to new drops and restocks",
  ],
};

/* ── Password field with a show/hide toggle ─────────────────────────── */
function PasswordField({
  id,
  name,
  autoComplete,
  placeholder,
  minLength,
  invalid,
  error,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  invalid?: boolean;
  error?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label-xs text-haze">
          Password
        </label>
        {name === "password" && autoComplete === "current-password" ? (
          /* Wired up when password reset lands — see HANDOFF.md. */
          <span className="text-xs text-haze" title="Coming soon">
            Forgot password?
          </span>
        ) : null}
      </div>

      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(invalid)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="field py-3 pr-11"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-haze transition-colors hover:text-fg"
        >
          {shown ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7 0 .9-.6 2.1-1.6 3.2M6.2 6.7C4.4 8 3 9.9 3 12c0 2.5 4 7 9 7 1.3 0 2.5-.3 3.6-.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.75" />
            </svg>
          )}
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-fg" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({
  mode,
  next,
  defaultEmail = "",
}: {
  mode: Mode;
  /** Where to go after a successful sign in/up. */
  next?: string;
  defaultEmail?: string;
}) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? customerSignUp : customerSignIn;
  const [state, formAction, pending] = useActionState(action, initialAuthState);
  const copy = COPY[mode];
  const errors = state.errors ?? {};

  return (
    <div className="w-full max-w-md">
      {/* ── Brand column. Hidden on mobile, where the form gets the full width. */}
      <aside className="section-ink mb-10 hidden flex-col justify-between rounded-[var(--radius-card)] p-10 lg:flex lg:min-h-[30rem]">
        <div>
          <Link href="/" className="inline-flex items-center text-2xl font-black tracking-[-0.06em]">
            RAV3S
            <span className="ml-1 inline-block h-2 w-2 rounded-full align-top bg-inverse-fg" />
          </Link>
          <p className="label-xs mt-10 text-inverse-fg/70">{copy.kicker}</p>
          <p className="mt-4 font-display text-4xl uppercase leading-[0.95]">
            {isSignUp ? "Your account, your history." : "Pick up where you left off."}
          </p>
        </div>

        <ul className="space-y-3.5 border-t border-inverse-fg/20 pt-8">
          {PERKS[mode].map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-inverse-fg/85">
              <span aria-hidden className="mt-0.5 text-xs">
                ✦
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Form column ───────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center text-xl font-black tracking-[-0.06em]"
        >
          RAV3S
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full align-top bg-fg" />
        </Link>
      </div>

      <div className="mt-8 lg:mt-0">
        <h1 className="text-2xl font-black uppercase md:text-3xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg/70">{copy.body}</p>

        <form action={formAction} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next ?? ""} />

          {isSignUp ? (
            <div>
              <label htmlFor="name" className="label-xs text-haze">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                autoComplete="name"
                placeholder="As it should appear on your parcel"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="field mt-2 py-3"
              />
              {errors.name ? (
                <p id="name-error" className="mt-1.5 text-xs text-fg" role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="label-xs text-haze">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={defaultEmail}
              placeholder="you@email.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="field mt-2 py-3"
            />
            {errors.email ? (
              <p id="email-error" className="mt-1.5 text-xs text-fg" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <PasswordField
            id="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={
              isSignUp ? `At least ${CUSTOMER_PASSWORD_MIN} characters` : "Your password"
            }
            minLength={CUSTOMER_PASSWORD_MIN}
            invalid={Boolean(errors.password)}
            error={errors.password}
          />

          {isSignUp ? (
            <PasswordField
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              placeholder="Type it once more"
              minLength={CUSTOMER_PASSWORD_MIN}
              invalid={Boolean(errors.confirm)}
              error={errors.confirm}
            />
          ) : null}

          {state.message ? (
            <p
              className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs leading-relaxed text-fg"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full py-4 text-xs"
          >
            {pending ? copy.pending : copy.cta}
          </button>
        </form>

        <p className="mt-7 border-t border-line pt-6 text-center text-sm text-fg/70">
          {isSignUp ? "Already have an account? " : "No account yet? "}
          <Link
            href={
              isSignUp
                ? `/account/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`
                : `/account/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`
            }
            className="font-semibold text-fg underline underline-offset-4"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-haze">
          <Link href="/" className="underline underline-offset-4 hover:text-fg">
            Continue as a guest
          </Link>
        </p>
      </div>
    </div>
  );
}