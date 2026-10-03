"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { customerRemoveAvatar, customerUpdateAvatar } from "@/app/account/actions";
import { initialAuthState, type AuthState } from "@/app/account/state";
import { Avatar } from "@/components/account/avatar";
import { TrashIcon, UploadIcon } from "@/components/icons";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";

/**
 * Profile photo controls.
 *
 * One form, one real <input type="file"> — the browser owns the multipart body,
 * so there is nothing to hand-assemble. Picking a file previews it immediately
 * via an object URL (revoked on every change so the blob does not leak), then
 * "Save photo" submits and "Discard" resets.
 */
export function AvatarForm({
  name,
  currentAvatar,
  muted = false,
  locale,
}: {
  name: string;
  currentAvatar: string | null;
  /** Dim the initials preview — used when inviting the user to add a photo. */
  muted?: boolean;
  locale: Locale;
}) {
  const [upload, uploadAction, uploading] = useActionState<AuthState, FormData>(
    customerUpdateAvatar,
    initialAuthState
  );
  const [remove, removeAction, removing] = useActionState<AuthState, FormData>(
    customerRemoveAvatar,
    initialAuthState
  );
  const t = makeTranslator(locale);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // The same form now renders on /account and /account/details, so a fixed
  // input id would collide and break the <label for> click target.
  const inputId = useId();

  const busy = uploading || removing;

  /* Once the server confirms the save, drop the local preview so the persisted
     avatar takes over. Without this the object URL would linger after a reload
     of only the client state. */
  const lastUploadMessage = useRef<string | null>(null);
  useEffect(() => {
    if (upload.ok && upload.messageKey && upload.messageKey !== lastUploadMessage.current) {
      lastUploadMessage.current = upload.messageKey;
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [upload.ok, upload.messageKey, preview]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  }

  function discard() {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const messageKey = upload.messageKey ?? remove.messageKey;
  const isError = Boolean(
    (upload.messageKey && !upload.ok) || (remove.messageKey && !remove.ok)
  );
  const hasPendingFile = preview !== null;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar
          name={name}
          src={preview ?? currentAvatar}
          size={80}
          className="ring-1 ring-line"
          muted={muted && !preview && !currentAvatar}
        />

        <form action={uploadAction} className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-fg/70">
            {t("account.avatarPreviewBody")}
          </p>

          <input
            ref={fileRef}
            id={inputId}
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />

          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <label
              htmlFor={inputId}
              className={`btn btn-ghost cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}
            >
              <UploadIcon className="h-4 w-4 shrink-0" />
              {hasPendingFile
                ? t("account.avatarChooseAnother")
                : currentAvatar
                  ? t("account.avatarReplace")
                  : t("account.avatarUpload")}
            </label>

            {hasPendingFile ? (
              <>
                <button type="submit" disabled={busy} className="btn btn-primary">
                  {uploading ? t("account.avatarUploading") : t("account.avatarSave")}
                </button>
                <button type="button" onClick={discard} disabled={busy} className="btn btn-ghost">
                  {t("account.avatarDiscard")}
                </button>
              </>
            ) : null}
          </div>

          {hasPendingFile ? (
            <p className="mt-2.5 truncate text-xs text-fg/65">{fileName}</p>
          ) : null}

          {!hasPendingFile ? (
            <p className="mt-2.5 text-xs text-fg/65">{t("account.avatarFormats")}</p>
          ) : null}
        </form>
      </div>

      {currentAvatar && !hasPendingFile ? (
        <form action={removeAction} className="mt-5 border-t border-line pt-4">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs text-fg/65 underline underline-offset-4 transition-colors hover:text-fg"
          >
            <TrashIcon className="h-3.5 w-3.5 shrink-0" />
            {removing ? t("account.avatarRemoving") : t("account.avatarRemove")}
          </button>
        </form>
      ) : null}

      {messageKey ? (
        <p
          className="mt-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-fg"
          role={isError ? "alert" : "status"}
        >
          {t(messageKey, upload.values ?? remove.values)}
        </p>
      ) : null}
    </div>
  );
}