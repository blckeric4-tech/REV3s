"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { initialActionState } from "@/app/admin/action-state";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";

export function LoginForm({ locale }: { locale: Locale }) {
  const [state, action, pending] = useActionState(login, initialActionState);
  const t = makeTranslator(locale);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label-xs text-inverse-fg/70">
          {t("adminLogin.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="field mt-2 border-transparent bg-transparent text-inverse-fg placeholder:text-inverse-fg/55"
        />
      </div>

      <div>
        <label htmlFor="password" className="label-xs text-inverse-fg/70">
          {t("adminLogin.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field mt-2 border-transparent bg-transparent text-inverse-fg placeholder:text-inverse-fg/55"
        />
      </div>

      {state.messageKey ? (
        /* This form sits on the pinned black admin panel, so the message must
           use the inverse text colour — `text-fg` here rendered black on black
           and the error was invisible. */
        <p className="text-xs text-inverse-fg" role="alert">
          {t(state.messageKey, state.values)}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-invert w-full">
        {pending ? t("adminLogin.signingIn") : t("adminLogin.signIn")}
      </button>
    </form>
  );
}