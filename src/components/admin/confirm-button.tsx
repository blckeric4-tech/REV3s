"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Confirmation modal for destructive, non-undoable actions (currently admin
 * sign out). The server action only runs after an explicit confirm, so a single
 * stray click cannot end the session.
 *
 * Generic on purpose — reuse for deleting a product or cancelling an order.
 */
export function ConfirmDialog({
  action,
  trigger,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  /** Subject shown in the warning row, e.g. "Signed in as admin@rav3s.com". */
  subject,
}: {
  /** A server action taking no arguments. */
  action: () => Promise<void>;
  /** Props for the button that opens the dialog. */
  trigger: { label: string; className?: string };
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  subject?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const bodyId = useId();

  /* Open: remember what had focus, move focus into the dialog, lock scroll. */
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      // Send focus back where it came from so keyboard users don't get dumped
      // at the top of the page.
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  /* Escape to cancel, Tab cycles inside the dialog. */
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!busy) setOpen(false);
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy]);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      // On success the action redirects away, so this line is never reached.
      await action();
      setOpen(false);
    } catch {
      setError("That did not work. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={trigger.className}
      >
        {trigger.label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button
            type="button"
            aria-label={cancelLabel}
            tabIndex={-1}
            onClick={() => !busy && setOpen(false)}
            className="dialog-backdrop absolute inset-0 cursor-default bg-black/60 backdrop-blur-[3px]"
          />

          <div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className="dialog-panel relative w-full max-w-md overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-[var(--radius-card)]"
          >
            {/* Warning strip — states the severity before the wording does. */}
            <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-6 py-4">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse font-display text-sm text-inverse-fg"
              >
                !
              </span>
              <p className="label-xs text-haze">Please confirm</p>
            </div>

            <div className="px-6 py-6">
              <h2 id={titleId} className="text-xl font-black uppercase md:text-2xl">
                {title}
              </h2>
              <p id={bodyId} className="mt-3 text-sm leading-relaxed text-fg/70">
                {body}
              </p>

              {subject ? (
                <div className="mt-5 flex items-baseline justify-between gap-4 border-y border-line py-3 text-xs">
                  <span className="label-xs text-haze">Account</span>
                  <span className="truncate font-semibold">{subject}</span>
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-fg" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-line bg-surface-2 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="btn btn-ghost sm:min-w-32"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={confirm}
                disabled={busy}
                className="btn btn-primary sm:min-w-32"
              >
                {busy ? "Working…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Convenience wrapper for the admin sign-out case. */
export function ConfirmButton({
  action,
  label,
  title,
  body,
  confirmLabel,
  cancelLabel,
  subject,
  className,
}: {
  action: () => Promise<void>;
  label: string;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  subject?: string;
  className?: string;
}) {
  return (
    <ConfirmDialog
      action={action}
      trigger={{ label, className }}
      title={title}
      body={body}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      subject={subject}
    />
  );
}