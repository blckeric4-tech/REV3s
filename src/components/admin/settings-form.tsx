"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/settings";
import { parseList } from "@/lib/money";
import { ImagePicker } from "@/components/admin/image-picker";

type Props = { settings: Settings };

/**
 * Picks whichever of the two brand colours stays readable on `hex`, so the
 * preview chips never show white-on-white when a pale accent is chosen.
 */
function readableOn(hex: string, onDark: string, onLight: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return onDark;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? onDark : onLight;
}

export function SettingsForm({
  settings,
  categories,
  valueProps,
}: Props & { categories: string[]; valueProps: string[] }) {
  const [pending, setPending] = useState(false);
  const [ink, bone, volt, clay] = [
    settings.colorInk,
    settings.colorBone,
    settings.colorVolt,
    settings.colorClay,
  ];

  return (
    <form
      action={saveSettings}
      onSubmit={() => setPending(true)}
      className="space-y-5"
    >
      {/* ---------------- BRAND ---------------- */}
      <Section title="Brand" hint="Name and wordmark shown across the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Site name" name="siteName" defaultValue={settings.siteName} />
          <Input label="Tagline" name="tagline" defaultValue={settings.tagline} />
          <Input label="Logo text" name="logoText" defaultValue={settings.logoText} />
          <Input label="Logo mark" name="logoMark" defaultValue={settings.logoMark} />
        </div>
      </Section>

      {/* ---------------- COLOURS ---------------- */}
      <Section
        title="Colours"
        hint="These drive every button, badge and highlight on the site."
      >
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <ColorInput label="Ink" name="colorInk" value={ink} />
          <ColorInput label="Bone" name="colorBone" value={bone} />
          <ColorInput label="Volt" name="colorVolt" value={volt} />
          <ColorInput label="Clay" name="colorClay" value={clay} />
          <ColorInput label="Haze" name="colorHaze" value={settings.colorHaze} />
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-line">
          <p className="label-xs bg-inverse px-4 py-2 text-inverse-fg/80">Live preview</p>
          <div
            className="flex flex-wrap items-center gap-3 p-5"
            style={{ backgroundColor: bone, color: ink }}
          >
            <span className="text-xl font-black tracking-[-0.06em]">
              {settings.logoText || "RAV3S"}
              <span
                className="ml-1 inline-block h-2 w-2 rounded-full align-top"
                style={{ backgroundColor: volt }}
              />
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: ink, color: bone }}
            >
              Primary
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: volt, color: ink }}
            >
              Accent
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: clay, color: readableOn(clay, bone, ink) }}
            >
              Highlight
            </span>
            <span className="text-xs" style={{ color: settings.colorHaze }}>
              Muted supporting text
            </span>
          </div>
        </div>
      </Section>

      {/* ---------------- ANNOUNCEMENT ---------------- */}
      <Section title="Announcement bar" hint="The scrolling strip at the very top.">
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="announcementOn"
              defaultChecked={settings.announcementOn}
              className="h-4 w-4 accent-fg"
            />
            Show the announcement bar
          </label>
          <Input
            label="Announcement text"
            name="announcementText"
            defaultValue={settings.announcementText}
          />
        </div>
      </Section>

      {/* ---------------- HERO ---------------- */}
      <Section title="Landing page hero" hint="The first thing visitors see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Kicker" name="heroKicker" defaultValue={settings.heroKicker} />
          <div className="sm:col-span-2">
            <ImagePicker
              name="heroImage"
              label="Hero image"
              defaultValue={settings.heroImage}
              single
              hint="Upload from your computer or paste a URL. A remote URL is downloaded into the project on save."
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="How the hero image should fit"
              name="heroFit"
              defaultValue={settings.heroFit === "cover" ? "cover" : "contain"}
              hint="Fit (show whole photo) leaves black bars when the photo is a different shape than the screen. Fill looks full-bleed but crops the edges."
              options={[
                { value: "contain", label: "Fit — show the whole photo (no cropping)" },
                { value: "cover", label: "Fill — cover the screen, cropping the edges" },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <Input label="Headline" name="heroTitle" defaultValue={settings.heroTitle} />
          </div>
          <div className="sm:col-span-2">
            <TextArea label="Supporting copy" name="heroBody" defaultValue={settings.heroBody} rows={3} />
          </div>
          <Input label="Button text" name="heroCtaText" defaultValue={settings.heroCtaText} />
          <Input label="Button link" name="heroCtaHref" defaultValue={settings.heroCtaHref} />
          <Input
            label="Secondary button text"
            name="heroSecondaryText"
            defaultValue={settings.heroSecondaryText}
          />
          <Input label="Secondary button link" name="heroSecondaryHref" defaultValue={settings.heroSecondaryHref} />
        </div>
      </Section>

      {/* ---------------- VIDEO & GALLERY ---------------- */}
      <Section
        title="Video & lookbook"
        hint="Add a video to the hero and photos to the scrolling strip and lookbook."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImagePicker
              name="heroVideo"
              label="Hero video"
              kind="video"
              defaultValue={settings.heroVideo}
              single
              hint="Choose a file from your computer, or paste a URL ending in .mp4 or .webm. Leave empty to use the hero image instead. We recommend a 10-20 second clip."
            />
          </div>
          <div className="sm:col-span-2">
            <ImagePicker
              name="videoPoster"
              label="Video poster image"
              defaultValue={settings.videoPoster}
              single
              hint="Shown before the video starts playing. Leave empty to use the hero image."
            />
          </div>
          <div className="sm:col-span-2">
            <ImagePicker
              name="galleryImages"
              label="Scrolling photo strip on the home page"
              defaultValue={parseList(settings.galleryImages).join(", ")}
              hint="Add several pictures here — they appear in the row that scrolls sideways just under the hero. Select more than one file at a time, then press Save site settings. Remote URLs are downloaded into the project on save."
            />
          </div>
        </div>
      </Section>

      {/* ---------------- INTERNATIONAL ---------------- */}
      <Section
        title="WhatsApp, phone & location"
        hint="The floating WhatsApp button, the footer contact block and the Google Map."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="whatsappOn"
              defaultChecked={settings.whatsappOn}
              className="h-4 w-4 accent-fg"
            />
            Show the floating WhatsApp button
          </label>
          <div />
          <Input
            label="WhatsApp number"
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            placeholder="0788123456"
            hint="Local format. The country code is added automatically."
          />
          <Input
            label="Phone number"
            name="phoneNumber"
            defaultValue={settings.phoneNumber}
            placeholder="+250 788 000 000"
          />
          <div className="sm:col-span-2">
            <Input
              label="Pre-filled WhatsApp message"
              name="whatsappMessage"
              defaultValue={settings.whatsappMessage}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Shop address / district"
              name="mapAddress"
              defaultValue={settings.mapAddress}
              placeholder="KN 5 Ave, Kigali, Rwanda"
              hint="Used to place the Google Map and the directions link."
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Google Maps embed URL"
              name="mapEmbedUrl"
              defaultValue={settings.mapEmbedUrl}
              placeholder="https://www.google.com/maps/embed?pb=..."
              hint="Optional. In Google Maps choose Share > Embed a map and paste the URL. Leave empty to search the address automatically."
            />
          </div>
          <Input label="Instagram URL" name="instagramUrl" defaultValue={settings.instagramUrl} />
          <Input label="TikTok URL" name="tiktokUrl" defaultValue={settings.tiktokUrl} />
          <Input label="Facebook URL" name="facebookUrl" defaultValue={settings.facebookUrl} />
        </div>
      </Section>

      {/* ---------------- STORY ---------------- */}
      <Section title="Brand story" hint="The about strip on the landing page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Kicker" name="storyKicker" defaultValue={settings.storyKicker} />
          <div className="sm:col-span-2">
            <ImagePicker
              name="storyImage"
              label="Story image"
              defaultValue={settings.storyImage}
              single
            />
          </div>
          <div className="sm:col-span-2">
            <Input label="Headline" name="storyTitle" defaultValue={settings.storyTitle} />
          </div>
          <div className="sm:col-span-2">
            <TextArea label="Body" name="storyBody" defaultValue={settings.storyBody} rows={4} />
          </div>
        </div>
      </Section>

      {/* ---------------- LISTS ---------------- */}
      <Section
        title="Value props & categories"
        hint="One item per line. Categories drive the shop filters."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label="Value props (highlight strip)"
            name="valueProps"
            defaultValue={valueProps.join("\n")}
            rows={4}
          />
          <TextArea
            label="Categories"
            name="categories"
            defaultValue={categories.join("\n")}
            rows={4}
          />
        </div>
      </Section>

      {/* ---------------- SHOP ---------------- */}
      <Section title="Shop page" hint="Headings on the product listing.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Shop heading" name="shopTitle" defaultValue={settings.shopTitle} />
          <Input
            label="Shop description"
            name="shopDescription"
            defaultValue={settings.shopDescription}
          />
        </div>
      </Section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <Section title="Newsletter sign-up" hint="The coloured block near the footer.">
        <div className="space-y-4">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="newsletterEnabled"
              defaultChecked={settings.newsletterEnabled}
              className="h-4 w-4 accent-fg"
            />
            Show the newsletter block
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Headline"
              name="newsletterTitle"
              defaultValue={settings.newsletterTitle}
            />
            <Input
              label="Body"
              name="newsletterBody"
              defaultValue={settings.newsletterBody}
            />
          </div>
        </div>
      </Section>

      {/* ---------------- FOOTER ---------------- */}
      <Section title="Footer & contact" hint="Socials and contact details.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextArea label="About text" name="footerAbout" defaultValue={settings.footerAbout} rows={2} />
          </div>
          <Input label="Instagram URL" name="footerInstagram" defaultValue={settings.footerInstagram} />
          <Input label="TikTok URL" name="footerTiktok" defaultValue={settings.footerTiktok} />
          <Input label="Email" name="footerEmail" defaultValue={settings.footerEmail} />
          <Input label="Address" name="footerAddress" defaultValue={settings.footerAddress} />
        </div>
      </Section>

      {/* ---------------- COMMERCE ---------------- */}
      <Section title="Shipping & stock" hint="Applied at checkout and in the admin alerts.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Currency code" name="currency" defaultValue={settings.currency} hint="e.g. rwf, usd, gbp" />
          <Input
            label="Flat shipping"
            name="shippingFlat"
            type="number"
            step="1"
            min="0"
            defaultValue={(settings.shippingFlatCents / 100).toFixed(0)}
          />
          <Input
            label="Free shipping over"
            name="freeShippingOver"
            type="number"
            step="1"
            min="0"
            defaultValue={(settings.freeShippingOverCents / 100).toFixed(0)}
          />
          <Input
            label="Low stock alert at"
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={settings.lowStockThreshold}
          />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10">
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-fg bg-inverse px-5 py-4 text-inverse-fg shadow-lg">
          <p className="text-xs text-inverse-fg/80">
            Changes go live across the whole site on save.
          </p>
          <button type="submit" disabled={pending} className="btn btn-volt">
            {pending ? "Saving..." : "Save all changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-fg/65">{hint}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Input({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label-xs text-fg/65">{label}</span>
      <input {...props} className="field mt-2" />
      {hint ? <span className="mt-1.5 block text-xs text-fg/65">{hint}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="label-xs text-fg/65">{label}</span>
      <textarea {...props} className="field mt-2" />
      {hint ? <span className="mt-1.5 block text-xs text-fg/65">{hint}</span> : null}
    </label>
  );
}

function Select({
  label,
  hint,
  options,
  ...props
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="label-xs text-fg/65">{label}</span>
      <select {...props} className="field mt-2">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-1.5 block text-xs text-fg/65">{hint}</span> : null}
    </label>
  );
}

function ColorInput({ label, name, value }: { label: string; name: string; value: string }) {
  const [hex, setHex] = useState(value);

  return (
    <label className="block">
      <span className="label-xs text-fg/65">{label}</span>
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded border border-line bg-surface p-0.5"
          tabIndex={-1}
          aria-label={`${label} colour picker`}
        />
        <input
          name={name}
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="field px-2 py-2 font-mono text-xs uppercase"
          spellCheck={false}
        />
      </span>
    </label>
  );
}
