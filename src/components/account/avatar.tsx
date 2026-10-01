"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Profile picture with an initials fallback.
 *
 * Used in the header and the account page so a shopper sees the same face in
 * both places. Falls back to the monogram when there is no photo, and also when
 * the photo fails to load — which happens if an upload was deleted from disk,
 * and must not leave a broken image in the header.
 *
 * Client-side purely so it can watch for the load error; it renders no state of
 * its own beyond that.
 */
export function Avatar({
  name,
  src,
  size = 32,
  className = "",
  priority = false,
  ringClassName = "",
  muted = false,
}: {
  name: string;
  src?: string | null;
  /** Rendered size in px. */
  size?: number;
  className?: string;
  priority?: boolean;
  /** Extra classes for the image itself, e.g. a focus ring. */
  ringClassName?: string;
  /** Dims the initials fallback — used while inviting the user to add a photo. */
  muted?: boolean;
}) {
  // Track *which* src failed rather than a bare boolean: when the user picks a
  // new photo the preview src changes, and a stale `true` would keep showing
  // initials for a perfectly valid new image.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R";

  const shell =
    "relative shrink-0 overflow-hidden rounded-full bg-inverse select-none";

  if (showImage) {
    return (
      <span className={`${shell} ${className}`} style={{ width: size, height: size }}>
        <Image
          src={src as string}
          alt=""
          fill
          sizes={`${size}px`}
          priority={priority}
          className={`object-cover ${ringClassName}`}
          onError={() => setFailedSrc(src as string)}
        />
      </span>
    );
  }

  return (
    <span
      className={`${shell} ${className} flex items-center justify-center text-inverse-fg ${ringClassName} ${
        muted ? "opacity-40" : ""
      }`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-black leading-none"
        style={{ fontSize: Math.max(9, Math.round(size * 0.36)) }}
      >
        {initials}
      </span>
    </span>
  );
}