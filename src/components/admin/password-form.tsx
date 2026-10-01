"use client";

import { useActionState } from "react";
import { changePassword, type ActionState } from "@/app/admin/actions";
import type { Translate } from "@/lib/i18n";

const initial: ActionState = { ok: false, message: "" };

export function PasswordForm({ t }: { t: Translate }) {
  const [state, action, pending] = useActionState(changePassword, initial);

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

      {state.message ? (
        <p
          className={`text-xs ${state.ok ? "text-fg" : "text-fg"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
