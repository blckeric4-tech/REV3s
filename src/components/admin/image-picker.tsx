"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  /** Form field name. */
  name: string;
  label: string;
  hint?: string;
  /** Comma-separated default value. */
  defaultValue?: string;
  single?: boolean;
  error?: string;
  /** "video" swaps the preview and accept list for the hero video field. */
  kind?: "image" | "video";
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/ogg";
const IMAGE_EXT = /\.(svg|png|jpe?g|webp|avif|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogv)$/i;

/**
 * Media field with three ways to set a path:
 *   • upload from the computer (goes straight to /api/upload)
 *   • paste a URL
 *   • type a path
 *
 * Always submits a plain comma-separated string via a hidden input, so it works
 * with the existing server action untouched.
 */
export function ImagePicker({
  name,
  label,
  hint,
  defaultValue = "",
  single = false,
  error,
  kind = "image",
}: Props) {
  const isVideo = kind === "video";
  const initial = defaultValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [paths, setPaths] = useState<string[]>(single ? initial.slice(0, 1) : initial);
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const value = paths.join(", ");

  function set(next: string[]) {
    setPaths(single ? next.slice(0, 1) : next);
    setMsg("");
  }

  function addPath(p: string) {
    const trimmed = p.trim();
    if (!trimmed) return;
    if (paths.includes(trimmed)) return;
    set(single ? [trimmed] : [...paths, trimmed]);
    setUrlDraft("");
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg("");
    const done: string[] = [];

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        done.push(data.url);
      } catch (e) {
        setMsg(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }

    if (done.length) set(single ? [done[0]] : [...paths, ...done]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {hint ? <p className="mb-2 text-xs text-fg/65">{hint}</p> : null}

      <input type="hidden" name={name} value={value} />

      {paths.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-3">
          {paths.map((p, i) => (
            <li key={p} className="relative">
              <div className="media-mat relative h-24 w-24 overflow-hidden rounded-lg border border-line">
                {isVideo && VIDEO_EXT.test(p) ? (
                  <video src={p} className="h-full w-full object-contain" muted playsInline />
                ) : !isVideo && IMAGE_EXT.test(p) ? (
                  <Image
                    src={p}
                    alt=""
                    fill
                    sizes="96px"
                    unoptimized
                    className="media-fit"
                  />
                ) : (
                  <p className="flex h-full w-full items-center justify-center p-1 text-center text-[9px] text-fg/65">
                    {p.split("/").pop()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => set(paths.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-inverse text-inverse-fg"
                aria-label={`Remove ${isVideo ? "video" : "image"} ${i + 1}`}
              >
                &times;
              </button>
              {paths.length === 1 && !isVideo ? (
                <span className="label-xs absolute bottom-1 left-1 rounded bg-inverse px-1.5 py-0.5 text-inverse-fg">
                  Main
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-fg/65">
          {isVideo ? "No video yet." : "No image yet."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn btn-primary h-9 px-4 text-[0.65rem]"
        >
          {busy ? "Uploading..." : isVideo ? "Upload video" : "Upload from computer"}
        </button>
        {!single ? (
          <button
            type="button"
            onClick={() => set([])}
            disabled={paths.length === 0}
            className="btn btn-outline h-9 px-4 text-[0.65rem] disabled:opacity-60"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT}
        multiple={!single && !isVideo}
        onChange={(e) => uploadFiles(e.target.files)}
        className="hidden"
      />

      <div className="mt-2 flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPath(urlDraft);
            }
          }}
          placeholder={
            isVideo
              ? "Paste a video URL (.mp4 / .webm), then press Enter"
              : "Paste an image URL or path, then press Enter"
          }
          className="field font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => addPath(urlDraft)}
          disabled={!urlDraft.trim()}
          className="btn btn-outline h-10 shrink-0 px-4 text-[0.65rem] disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {msg ? <p className="mt-2 text-xs text-fg">{msg}</p> : null}
      {error ? <p className="mt-2 text-xs text-fg">{error}</p> : null}
    </div>
  );
}
