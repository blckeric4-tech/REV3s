/**
 * Icon set.
 *
 * All icons share one visual language so the header reads as a single system:
 * 24×24 viewBox, `currentColor` stroke, 1.6 stroke-width, round caps and joins,
 * no fill. That matches the site's fine-lined, monochrome identity — heavier
 * strokes or filled shapes would look pasted on next to the hairline rules.
 *
 * Every icon is decorative by default (`aria-hidden`); the accessible name always
 * lives on the control that wraps it, never on the SVG. Pass a `title` only when
 * the icon is genuinely the sole content of a control.
 */

type IconProps = {
  className?: string;
  /** Supply only when the icon is the control's only content. */
  title?: string;
};

function Svg({
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ── Header ─────────────────────────────────────────────────────────── */

/** Person silhouette for the account control. */
export function UserIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.75 20.25c0-3.72 3.25-5.75 7.25-5.75s7.25 2.03 7.25 5.75" />
    </Svg>
  );
}

/**
 * Shopping bag.
 *
 * Two shapes only: a tapered body with softly rounded bottom corners, and a
 * perfect semicircular handle that springs from the two ends of the rim. The
 * earlier version drew the handle from inside the body, which read as a strap
 * poking out of the bag rather than being attached to it — anchoring both ends
 * exactly on the rim line is what makes it legible as a bag at 20px.
 *
 * Geometry: rim at y=8.2 spanning x 5.6→18.4 (centre 12). The handle arc spans
 * x 9.6→14.4, i.e. exactly 2r, so `a2.4 2.4` draws a clean half-circle peaking
 * at y=5.8. Body tapers to x 6.7→17.3 at the base, keeping the same centre.
 */
export function BagIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      {/* Body */}
      <path d="M5.6 8.2h12.8l-1.1 11a1.5 1.5 0 0 1-1.5 1.35H8.2a1.5 1.5 0 0 1-1.5-1.35L5.6 8.2Z" />
      {/* Handle: one arc, both ends landing on the rim */}
      <path d="M9.6 8.2a2.4 2.4 0 0 1 4.8 0" />
    </Svg>
  );
}

/** Small chevron for dropdown triggers. */
export function ChevronDownIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="m6.5 9.5 5.5 5 5.5-5" />
    </Svg>
  );
}

/* ── Menu ───────────────────────────────────────────────────────────── */

/** Two bars. Replaced by a cross when the mobile menu is open. */
export function MenuIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/* ── Account area ───────────────────────────────────────────────────── */

export function PackageIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M20.5 8.5v7a1.6 1.6 0 0 1-.85 1.41l-6.9 3.6a1.6 1.6 0 0 1-1.5 0l-6.9-3.6a1.6 1.6 0 0 1-.85-1.41v-7a1.6 1.6 0 0 1 .85-1.41l6.9-3.6a1.6 1.6 0 0 1 1.5 0l6.9 3.6a1.6 1.6 0 0 1 .85 1.41Z" />
      <path d="m3.9 7.6 8.1 4.2 8.1-4.2M12 20.6v-8.8" />
    </Svg>
  );
}

export function SettingsIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.4v2.1M12 18.5v2.1M20.6 12h-2.1M5.5 12H3.4M18.1 5.9l-1.5 1.5M7.4 16.6l-1.5 1.5M18.1 18.1l-1.5-1.5M7.4 7.4 5.9 5.9" />
    </Svg>
  );
}

export function LogOutIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M14.5 7.5V5.6A1.6 1.6 0 0 0 12.9 4H5.6A1.6 1.6 0 0 0 4 5.6v12.8A1.6 1.6 0 0 0 5.6 20h7.3a1.6 1.6 0 0 0 1.6-1.6v-1.9" />
      <path d="M9.8 12h10.2M16.8 8.8 20 12l-3.2 3.2" />
    </Svg>
  );
}

/** Matches the existing text links elsewhere in the site. */
export function ArrowRightIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M4.5 12h14M13.5 7l5 5-5 5" />
    </Svg>
  );
}

/* ── Shop ───────────────────────────────────────────────────────────── */

export function TruckIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M3.5 6.4A1.4 1.4 0 0 1 4.9 5h8.2a1.4 1.4 0 0 1 1.4 1.4v9.2H3.5V6.4Z" />
      <path d="M14.5 9.4h3.3a1.4 1.4 0 0 1 1.12.56l2.2 2.94a1.4 1.4 0 0 1 .28.84v2.36h-6.9V9.4Z" />
      <circle cx="7.4" cy="18" r="1.9" />
      <circle cx="17.2" cy="18" r="1.9" />
      <path d="M9.3 18h6" />
    </Svg>
  );
}

export function RulerIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="m4.2 15.3 6.1-6.1a1.4 1.4 0 0 1 2 0l4.5 4.5a1.4 1.4 0 0 1 0 2l-6.1 6.1a1.4 1.4 0 0 1-2 0l-4.5-4.5a1.4 1.4 0 0 1 0-2Z" />
      <path d="m13.9 9.3 1.9 1.9M11.1 12.1l1.9 1.9M8.3 14.9l1.9 1.9" />
    </Svg>
  );
}

/** Package variant for the shipping-info card (distinct from `PackageIcon`). */
export function BoxIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M4.6 8.2 12 4.5l7.4 3.7v7.6L12 19.5l-7.4-3.7V8.2Z" />
      <path d="M4.6 8.2 12 11.9l7.4-3.7M12 11.9v7.6" />
    </Svg>
  );
}

/* ── Status, used inside `.status-pill` ─────────────────────────────── */

export function CheckIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  );
}

export function ClockIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.1 1.9" />
    </Svg>
  );
}

/* ── Plan & billing ─────────────────────────────────────────────────── */

/**
 * Attention triangle.
 *
 * Drawn on a true equilateral triangle (12 → 3.6,20.7 → 20.4,20.7) rather than
 * the boxy `(12 3, 21 20, 3 20)` that most icon sets use, so it reads as a
 * deliberate warning mark instead of a generic glyph. The exclamation is
 * detached from the apex and stops short of the base to keep the counters open
 * at small sizes.
 */
export function AlertTriangleIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M12 3.6 20.4 20.7H3.6L12 3.6Z" />
      <path d="M12 9.4v4.4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}

/** Stacked rack — reads as "the thing that hosts your service". */
export function ServerIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <rect x="3.6" y="4.2" width="16.8" height="6" rx="1.4" />
      <rect x="3.6" y="13.8" width="16.8" height="6" rx="1.4" />
      <path d="M7 7.2h.01M7 16.8h.01" />
    </Svg>
  );
}

export function CreditCardIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2" />
      <path d="M2.75 9.9h18.5" />
      <path d="M6.4 14.8h3.2" />
    </Svg>
  );
}

/* ── Uploads ────────────────────────────────────────────────────────── */

/**
 * Tray with an arrow leaving it. Reads as "send something up" rather than as a
 * generic "+", which is what makes it obvious this is a file picker.
 */
export function UploadIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M4.4 15.2v2.4a1.8 1.8 0 0 0 1.8 1.8h11.6a1.8 1.8 0 0 0 1.8-1.8v-2.4" />
      <path d="M12 4.2v10.6M8.2 7.9 12 4.1l3.8 3.8" />
    </Svg>
  );
}

export function TrashIcon({ className, title }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M4.8 6.8h14.4M9.6 6.8V5.6A1.3 1.3 0 0 1 10.9 4.3h2.2a1.3 1.3 0 0 1 1.3 1.3v1.2" />
      <path d="M6.6 6.8l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
      <path d="M10.4 10.6v6M13.6 10.6v6" />
    </Svg>
  );
}