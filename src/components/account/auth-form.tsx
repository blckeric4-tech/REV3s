"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { customerSignIn, customerSignUp } from "@/app/account/actions";
import { initialAuthState } from "@/app/account/state";
import { CUSTOMER_PASSWORD_MIN } from "@/lib/customer-auth-constants";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";
import type { TranslationKey } from "@/lib/i18n/en";

type Mode = "sign-in" | "sign-up";

/** Keys rather than sentences, so each mode stays a lookup instead of a copy. */
const COPY: Record<
  Mode,
  { kicker: TranslationKey; title: TranslationKey; body: TranslationKey; cta: TranslationKey; pending: TranslationKey }
> = {
  "sign-in": {
    kicker: "account.welcomeBack",
    title: "account.signInTitle",
    body: "account.signInKickerBody",
    cta: "account.signInButton",
    pending: "account.signingIn",
  },
  "sign-up": {
    kicker: "account.createAccountKicker",
    title: "account.joinRav3s",
    body: "account.signUpKickerBody",
    cta: "account.signUpButton",
    pending: "account.creatingAccount",
  },
};

const HERO_TITLE: Record<Mode, TranslationKey> = {
  "sign-in": "account.signInHeroTitle",
  "sign-up": "account.signUpHeroTitle",
};

const PERKS: Record<Mode, TranslationKey[]> = {
  "sign-in": ["account.perkSignIn1", "account.perkSignIn2", "account.perkSignIn3"],
  "sign-up": ["account.perkSignUp1", "account.perkSignUp2", "account.perkSignUp3"],
};

/* ── Password field with a show/hide toggle ─────────────────────────── */
function PasswordField({
  id,
  name,
  autoComplete,
  placeholder,
  minLength,
  invalid,
  errorText,
  locale,
}: {
  id: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  invalid?: boolean;
  /** Already translated by the caller, so this stays a dumb presentational field. */
  errorText?: string;
  locale: Locale;
}) {
  const [shown, setShown] = useState(false);
  const t = makeTranslator(locale);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label-xs text-haze">
          {t("account.password")}
        </label>
        {name === "password" && autoComplete === "current-password" ? (
          /* Wired up when password reset lands — see HANDOFF.md. */
          <span className="text-xs text-haze" title={t("account.comingSoon")}>
            {t("account.forgotPassword")}
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
          aria-describedby={errorText ? `${id}-error` : undefined}
          className="field py-3 pr-11"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? t("account.hidePassword") : t("account.showPassword")}
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

      {errorText ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-fg" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({
  mode,
  next,
  defaultEmail = "",
  locale,
}: {
  mode: Mode;
  /** Where to go after a successful sign in/up. */
  next?: string;
  defaultEmail?: string;
  locale: Locale;
}) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? customerSignUp : customerSignIn;
  const [state, formAction, pending] = useActionState(action, initialAuthState);
  const copy = COPY[mode];
  const t = makeTranslator(locale);
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
          <p className="label-xs mt-10 text-inverse-fg/70">{t(copy.kicker)}</p>
          <p className="mt-4 font-display text-4xl uppercase leading-[0.95]">
            {t(HERO_TITLE[mode])}
          </p>
        </div>

        <ul className="space-y-3.5 border-t border-inverse-fg/20 pt-8">
          {PERKS[mode].map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-inverse-fg/85">
              <span aria-hidden className="mt-0.5 text-xs">
                ✦
              </span>
              {t(perk)}
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
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full align-top text-fg" />
        </Link>
      </div>

      <div className="mt-8 lg:mt-0">
        <h1 className="text-2xl font-black uppercase md:text-3xl">{t(copy.title)}</h1>
        <p className="mt-3 text-sm leading-relaxed text-fg/70">
          {t(copy.body, { min: CUSTOMER_PASSWORD_MIN })}
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <input type="hidden" name="next" value={next ?? ""} />

          {isSignUp ? (
            <div>
              <label htmlFor="name" className="label-xs text-haze">
                {t("account.fullName")}
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                autoComplete="name"
                placeholder={t("account.namePlaceholder")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="field mt-2 py-3"
              />
              {errors.name ? (
                <p id="name-error" className="mt-1.5 text-xs text-fg" role="alert">
                  {t(errors.name)}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="label-xs text-haze">
              {t("account.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={defaultEmail}
              placeholder={t("account.emailPlaceholder")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="field mt-2 py-3"
            />
            {errors.email ? (
              <p id="email-error" className="mt-1.5 text-xs text-fg" role="alert">
                {t(errors.email)}
              </p>
            ) : null}
          </div>

          <PasswordField
            id="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={
              isSignUp
                ? t("account.passwordPlaceholderSignUp", { min: CUSTOMER_PASSWORD_MIN })
                : t("account.passwordPlaceholderSignIn")
            }
            minLength={CUSTOMER_PASSWORD_MIN}
            invalid={Boolean(errors.password)}
            errorText={errors.password ? t(errors.password) : undefined}
            locale={locale}
          />

          {isSignUp ? (
            <PasswordField
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              placeholder={t("account.confirmPlaceholder")}
              minLength={CUSTOMER_PASSWORD_MIN}
              invalid={Boolean(errors.confirm)}
              errorText={errors.confirm ? t(errors.confirm) : undefined}
              locale={locale}
            />
          ) : null}

          {state.messageKey ? (
            <p
              className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs leading-relaxed text-fg"
              role="alert"
            >
              {t(state.messageKey, state.values)}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full py-4 text-xs"
          >
            {pending ? t(copy.pending) : t(copy.cta)}
          </button>
        </form>

        <p className="mt-7 border-t border-line pt-6 text-center text-sm text-fg/70">
          {isSignUp ? t("account.alreadyHave") : t("account.noAccountYet")}{" "}
          <Link
            href={
              isSignUp
                ? `/account/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`
                : `/account/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`
            }
            className="font-semibold text-fg underline underline-offset-4"
          >
            {isSignUp ? t("account.signInTitle") : t("account.createOne")}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-haze">
          <Link href="/" className="underline underline-offset-4 hover:text-fg">
            {t("account.continueGuest")}
          </Link>
        </p>
      </div>
    </div>
  );
}