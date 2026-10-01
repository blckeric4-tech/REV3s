import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 6 * 1024 * 1024;

/** Hero videos are much larger than stills, so they get their own ceiling. */
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const VIDEO_EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

const EXT_BY_PATH: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  gif: "gif",
  svg: "svg",
  mp4: "mp4",
  webm: "webm",
  mov: "mov",
  ogv: "ogv",
};

export class ImageStoreError extends Error {}

/** Persist image bytes into public/uploads and return the public path. */
export async function storeImage(bytes: Buffer, ext: string): Promise<string> {
  return storeAsset(bytes, ext);
}

/** Persist any media bytes (image or video) into public/uploads. */
export async function storeAsset(bytes: Buffer, ext: string): Promise<string> {
  const safeExt = EXT_BY_PATH[ext.toLowerCase()] ?? "jpg";
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export function isLocalAsset(value: string): boolean {
  return /^\/(?!\/)/.test(value);
}

/**
 * Validates a pasted remote media URL: http(s) only, and never aimed at the
 * local network or a cloud metadata service.
 */
function parseRemoteUrl(rawUrl: string, kind: "image" | "video"): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ImageStoreError(`"${rawUrl}" is not a valid URL.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ImageStoreError("Only http:// and https:// URLs are supported.");
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    /^(10\.|127\.|192\.168\.|169\.254\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    throw new ImageStoreError("That host is not reachable.");
  }

  void kind;
  return url;
}

/** True when the URL points at something that plays in a <video> tag. */
function looksLikeVideo(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  const head = buf.subarray(0, 16).toString("ascii");
  // ISO base media file format ("ftyp" box), used by MP4/MOV.
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") return true;
  // Matroska/WebM EBML header.
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return true;
  // Ogg container.
  return head.startsWith("OggS");
}

/**
 * Same job as mirrorRemoteImage but for the hero video: a <video> src has no
 * allow-list problem like next/image, but mirroring keeps every asset local and
 * means the storefront never depends on a third-party CDN.
 */
export async function mirrorRemoteVideo(rawUrl: string): Promise<string> {
  const trimmed = rawUrl.trim();
  if (isLocalAsset(trimmed)) return trimmed;
  if (!trimmed) return "";

  const url = parseRemoteUrl(trimmed, "video");

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
      headers: { accept: "video/*" },
    });
  } catch {
    throw new ImageStoreError("Could not reach that URL. Upload the file instead.");
  }
  if (!res.ok) {
    throw new ImageStoreError(`That URL returned ${res.status}. Upload the file instead.`);
  }

  const declaredType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const bytes = Buffer.from(await res.arrayBuffer());

  if (bytes.length === 0) throw new ImageStoreError("That URL returned an empty file.");
  if (bytes.length > MAX_VIDEO_BYTES) {
    throw new ImageStoreError("That video is larger than 40 MB. Upload a smaller file.");
  }

  let ext = VIDEO_EXT_BY_TYPE[declaredType];
  if (!ext) {
    const fromPath = path.extname(url.pathname).replace(".", "").toLowerCase();
    ext = EXT_BY_PATH[fromPath];
  }
  if (!ext) {
    throw new ImageStoreError("That URL did not return a usable video file.");
  }
  if (!looksLikeVideo(bytes)) {
    throw new ImageStoreError("That URL did not return a video file.");
  }

  return storeAsset(bytes, ext);
}

/**
 * Turn a pasted remote image URL into a local file under public/uploads.
 *
 * Product pages render through next/image, which refuses any host that is not
 * whitelisted in next.config.ts. Rather than maintain a list of every CDN a
 * shop owner might paste from, we mirror the file once at save time so the
 * storefront only ever serves local assets.
 */
export async function mirrorRemoteImage(rawUrl: string): Promise<string> {
  const trimmed = rawUrl.trim();
  if (isLocalAsset(trimmed)) return trimmed;

  const url = parseRemoteUrl(trimmed, "image");

  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { accept: "image/*" },
    });
  } catch {
    throw new ImageStoreError("Could not reach that URL. Upload the file instead.");
  }
  if (!res.ok) {
    throw new ImageStoreError(
      `That URL returned ${res.status}. Upload the file instead.`
    );
  }

  const declaredType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const bytes = Buffer.from(await res.arrayBuffer());

  if (bytes.length === 0) {
    throw new ImageStoreError("That URL returned an empty file.");
  }
  if (bytes.length > MAX_BYTES) {
    throw new ImageStoreError("That image is larger than 6 MB. Upload a smaller file.");
  }

  let ext = declaredType ? EXT_BY_TYPE[declaredType] : undefined;
  if (!ext) {
    const fromPath = path.extname(url.pathname).replace(".", "").toLowerCase();
    ext = EXT_BY_PATH[fromPath];
  }
  if (!ext) {
    throw new ImageStoreError("That URL did not return a usable image file.");
  }

  // Confirm the bytes really are an image, not an HTML error page with a
  // misleading content-type.
  if (!looksLikeImage(bytes)) {
    throw new ImageStoreError("That URL did not return an image file.");
  }

  return storeImage(bytes, ext);
}

function looksLikeImage(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true; // jpeg
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return true; // png
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return true;
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") return true; // avif/heic
  if (buf.subarray(0, 3).toString("ascii") === "GIF") return true;
  const head = buf.subarray(0, 200).toString("utf8").trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return true;
  return false;
}

/**
 * Map a comma/newline separated list of image values to local paths,
 * mirroring any remote entries. Rejects the whole batch if one entry fails.
 */
export async function mirrorImageList(value: string | undefined | null): Promise<string | null> {
  const items = (value ?? "")
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (await Promise.all(items.map((v) => mirrorRemoteImage(v)))).join(",");
}

export async function mirrorImageValue(value: string): Promise<string> {
  return mirrorRemoteImage(value);
}

/** Mirrors the hero video. An empty field stays empty. */
export async function mirrorVideoValue(value: string): Promise<string> {
  return mirrorRemoteVideo(value);
}
