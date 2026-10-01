/** Build a wa.me deep link with a pre-filled message. */
export function whatsappLink(number: string, message?: string) {
  const digits = String(number || "").replace(/\D/g, "");
  // wa.me wants the bare international number: drop the country code and the
  // local trunk zero, e.g. "0788354490" -> "788354490".
  const local = digits.replace(/^250/, "").replace(/^0+/, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${local}${text}`;
}

/** Digits-only version, for tel: links. */
export function phoneHref(number: string) {
  return `tel:${String(number || "").replace(/[^\d+]/g, "")}`;
}

export function telDigits(number: string) {
  return String(number || "").replace(/\D/g, "");
}
