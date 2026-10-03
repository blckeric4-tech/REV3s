"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/app/actions";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";

const initial: SubscribeState = { ok: false, messageKey: null };

export function NewsletterForm({
  className = "",
  locale,
}: {
  className?: string;
  locale: Locale;
}) {
  const [state, action, pending] = useActionState(subscribe, initial);
  const t = makeTranslator(locale);

  if (state.ok) {
    return (
      <p className="rounded-full bg-surface px-6 py-4 text-sm font-semibold text-fg">
        {state.messageKey ? t(state.messageKey) : null}
      </p>
    );
  }

  return (
    <form action={action} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          aria-label={t("newsletter.emailAddress")}
          className="field flex-1 border-transparent"
        />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
          {pending ? t("newsletter.joining") : t("newsletter.submit")}
        </button>
      </div>
      {state.messageKey ? (
        /* The newsletter block sits on the page background, so this must be the
           normal foreground colour — `text-inverse-fg` was white on white. */
        <p className="mt-3 text-xs text-fg" role="alert">
          {t(state.messageKey)}
        </p>
      ) : null}
    </form>
  );
}