import { whatsappLink } from "@/lib/contact";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";

type Props = {
  number: string;
  message?: string;
  enabled?: boolean;
  className?: string;
  locale: Locale;
};

/**
 * Floating WhatsApp button. Rendered on every public page so a visitor can
 * always reach a human — the main conversion path for a local brand.
 */
export function WhatsAppButton({ number, message, enabled = true, className = "", locale }: Props) {
  const t = makeTranslator(locale);
  if (!enabled || !number) return null;

  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("home.orderOnWhatsapp")}
      className={`group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-inverse text-inverse-fg shadow-lg transition-transform duration-200 hover:scale-105 sm:bottom-7 sm:right-7 ${className}`}
    >
      {/* Inline glyph — no icon dependency */}
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.88 2.38 1 2.55.12.16 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-inverse px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-inverse-fg opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        {t("home.orderOnWhatsapp")}
      </span>
    </a>
  );
}
