const ZERO_DECIMAL = new Set([
  "rwf", "ugx", "kes", "tzs", "bif", "djf", "gnf", "jpy", "vnd", "vuv", "xaf", "xof", "xpf",
]);

/**
 * `tag` is a BCP 47 tag (`en-GB`, `fr-FR`). It decides the thousands separator
 * and the decimal mark, so pass the active locale's tag; it defaults to
 * `en-US` so a call that forgets still renders.
 */
export function formatMoney(cents: number, currency = "rwf", tag = "en-US") {
  const code = String(currency || "rwf").toLowerCase();
  const amount = cents / 100;

  if (code === "rwf") return `${Math.round(amount).toLocaleString(tag)} FRW`;

  try {
    const noDecimals = ZERO_DECIMAL.has(code);
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: code.toUpperCase(),
      minimumFractionDigits: noDecimals ? 0 : amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString(tag)} ${code.toUpperCase()}`;
  }
}

export function currencySymbol(currency = "rwf", tag = "en-US") {
  const code = String(currency || "rwf").toLowerCase();
  if (code === "rwf") return "RWF";
  try {
    return (
      new Intl.NumberFormat(tag, { style: "currency", currency: code.toUpperCase() })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // fall through to comma split
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}