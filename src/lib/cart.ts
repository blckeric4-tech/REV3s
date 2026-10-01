export type CartLine = {
  variantId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  colorHex: string;
  image: string;
  priceCents: number;
  quantity: number;
  stock: number;
};

export const CART_KEY = "rav3s_cart_v1";

export function lineCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.quantity, 0);
}

export function subtotalCents(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.priceCents * l.quantity, 0);
}

export function shippingCentsFor(
  lines: CartLine[],
  flat: number,
  freeOver: number
) {
  if (lines.length === 0) return 0;
  const sub = subtotalCents(lines);
  if (freeOver > 0 && sub >= freeOver) return 0;
  return flat;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
