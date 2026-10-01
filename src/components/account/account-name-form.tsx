"use client";

import { useActionState } from "react";
import { initialAuthState, type AuthState } from "@/app/account/state";

export function AccountNameForm({
  action,
  currentName,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  currentName: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialAuthState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="account-name" className="label-xs text-haze">
          Display name
        </label>
        <input
          id="account-name"
          name="name"
          defaultValue={currentName}
          required
          minLength={2}
          autoComplete="name"
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? "account-name-error" : undefined}
          className="field mt-2 py-3"
        />
        {state.errors?.name ? (
          <p id="account-name-error" className="mt-1.5 text-xs text-fg" role="alert">
            {state.errors.name}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-fg"
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary mt-5">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}