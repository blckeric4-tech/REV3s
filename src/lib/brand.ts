/**
 * Small colour helpers shared by the storefront and the admin colour pickers.
 */

/** Perceived brightness of a #rgb / #rrggbb colour, 0 (black) to 1 (white). */
export function luminance(hex: string): number | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return null;
  let body = m[1];
  if (body.length === 3) body = body.replace(/./g, (c) => c + c);
  const n = parseInt(body, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** True when a colour is light enough that dark text reads better on top of it. */
export function isLightHex(hex: string): boolean {
  const l = luminance(hex);
  return l === null ? false : l > 0.55;
}

/**
 * Picks whichever of the two given colours stays readable on `hex`, so a chip or
 * a badge never ends up as black text on a black background. Without this, an
 * admin who leaves Ink and Volt both black gets an invisible logo mark and an
 * invisible cart count.
 */
export function readableOn(hex: string, onDark: string, onLight: string): string {
  return isLightHex(hex) ? onDark : onLight;
}
