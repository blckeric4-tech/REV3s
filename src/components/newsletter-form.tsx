"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions";

const initial = { ok: false, message: "" };

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [state, action, pending] = useActionState(subscribe, initial);

  if (state.ok) {
    return (
      <p className="rounded-full bg-surface px-6 py-4 text-sm font-semibold text-fg">
        {state.message}
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
          aria-label="Email address"
          className="field flex-1 border-transparent"
        />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
          {pending ? "Joining..." : "Sign up"}
        </button>
      </div>
      {state.message ? (
        /* The newsletter block sits on the page background, so this must be the
           normal foreground colour — `text-inverse-fg` was white on white. */
        <p className="mt-3 text-xs text-fg" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
