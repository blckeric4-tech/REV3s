import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/config";

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  compareCents?: number | null;
  image: string;
  badge?: string | null;
  colors: { color: string; colorHex: string }[];
  category: string;
  /** Localized category name for display; falls back to `category` when absent. */
  categoryLabel?: string;
  currency: string;
  priority?: boolean;
  locale?: Locale;
};

export function ProductCard({
  slug,
  name,
  priceCents,
  compareCents,
  image,
  badge,
  colors,
  category,
  categoryLabel,
  currency,
  priority,
  locale = "en",
}: Props) {
  const tag = LOCALE_TAGS[locale];
  // A product has one row per size+colour, so the same colour repeats. Collapse
  // to one swatch per colour or React gets duplicate keys.
  const swatches = Array.from(
    new Map(colors.map((c) => [c.color, c])).values()
  );

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        {badge ? (
          <span className="label-xs absolute left-3 top-3 z-10 rounded-full bg-inverse px-2.5 py-1.5 text-inverse-fg">
            {badge}
          </span>
        ) : null}

        {/* media-fit keeps the whole photo visible; media-mat is the backdrop
            that shows through when the photo is a different shape. */}
        <div className="media-mat relative aspect-4/5">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="media-fit transition-transform duration-500 group-hover:scale-[1.04]"
            preload={priority}
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 border-t border-line bg-surface px-3 py-2.5">
          {swatches.slice(0, 6).map((c) => (
            <span
              key={c.color}
              title={c.color}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-fg/15"
              style={{ backgroundColor: c.colorHex }}
            />
          ))}
          {swatches.length > 6 ? (
            <span className="label-xs text-fg/65">+{swatches.length - 6}</span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-xs text-fg/65">{categoryLabel || category}</p>
          <h3 className="mt-1 truncate text-sm font-semibold tracking-tight">{name}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold">{formatMoney(priceCents, currency, tag)}</p>
          {compareCents ? (
            <p className="text-xs text-fg/70 line-through">
              {formatMoney(compareCents, currency, tag)}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
