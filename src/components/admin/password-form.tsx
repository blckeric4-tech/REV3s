"use client";

import { useActionState } from "react";
import { changePassword, type ActionState } from "@/app/admin/actions";

const initial: ActionState = { ok: false, message: "" };

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <form action={action} className="space-y-3">
      <input
        name="current"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Current password"
        className="field"
      />
      <input
        name="next"
        type="password"
        required
        autoComplete="new-password"
        placeholder="New password (10+ chars, a letter and a number)"
        className="field"
      />
      <input
        name="confirm"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Confirm new password"
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
