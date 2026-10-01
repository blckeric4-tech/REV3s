"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/admin/actions";

const initial: ActionState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label-xs text-inverse-fg/70">
          Email
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
          Password
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

      {state.message ? (
        /* This form sits on the pinned black admin panel, so the message must
           use the inverse text colour — `text-fg` here rendered black on black
           and the error was invisible. */
        <p className="text-xs text-inverse-fg" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-invert w-full">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
