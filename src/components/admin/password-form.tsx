"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import { initialActionState } from "@/app/admin/action-state";
import type { Locale } from "@/lib/i18n/translate";
import { makeTranslator } from "@/lib/i18n/translate";

export function PasswordForm({ locale }: { locale: Locale }) {
  const t = makeTranslator(locale);
  const [state, action, pending] = useActionState(changePassword, initialActionState);

  return (
    <form action={action} className="space-y-3">
      <input
        name="current"
        type="password"
        required
        autoComplete="current-password"
        placeholder={t("admin.currentPassword")}
        aria-label={t("admin.currentPassword")}
        className="field"
      />
      <input
        name="next"
        type="password"
        required
        autoComplete="new-password"
        placeholder={t("admin.newPassword")}
        aria-label={t("admin.newPassword")}
        className="field"
      />
      <input
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        placeholder={t("admin.confirmPassword")}
        aria-label={t("admin.confirmPassword")}
        className="field"
      />

      {state.messageKey ? (
        <p className="text-xs text-fg" role="status">
          {t(state.messageKey, state.values)}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t("admin.updatingPassword") : t("admin.updatePassword")}
      </button>
    </form>
  );
}
