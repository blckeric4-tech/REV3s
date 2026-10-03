"use client";

import { useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/settings";
import { parseList } from "@/lib/money";
import { ImagePicker } from "@/components/admin/image-picker";
import { makeTranslator, type Locale } from "@/lib/i18n/translate";

type Props = { settings: Settings; locale: Locale };

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
  locale,
}: Props & { categories: string[]; valueProps: string[] }) {
  const t = makeTranslator(locale);
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
      <Section title={t("adminSet.brand")} hint={t("adminSet.brandHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("adminSet.siteName")} name="siteName" defaultValue={settings.siteName} />
          <Input label={t("adminSet.tagline")} name="tagline" defaultValue={settings.tagline} />
          <Input label={t("adminSet.logoText")} name="logoText" defaultValue={settings.logoText} />
          <Input label={t("adminSet.logoMark")} name="logoMark" defaultValue={settings.logoMark} />
        </div>
      </Section>

      {/* ---------------- COLOURS ---------------- */}
      <Section title={t("adminSet.colours")} hint={t("adminSet.coloursHint")}>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <ColorInput locale={locale} label={t("adminSet.ink")} name="colorInk" value={ink} />
          <ColorInput locale={locale} label={t("adminSet.bone")} name="colorBone" value={bone} />
          <ColorInput locale={locale} label={t("adminSet.volt")} name="colorVolt" value={volt} />
          <ColorInput locale={locale} label={t("adminSet.clay")} name="colorClay" value={clay} />
          <ColorInput
            locale={locale}
            label={t("adminSet.haze")}
            name="colorHaze"
            value={settings.colorHaze}
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-line">
          <p className="label-xs bg-inverse px-4 py-2 text-inverse-fg/80">
            {t("adminSet.livePreview")}
          </p>
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
              {t("adminSet.previewPrimary")}
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: volt, color: ink }}
            >
              {t("adminSet.previewAccent")}
            </span>
            <span
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: clay, color: readableOn(clay, bone, ink) }}
            >
              {t("adminSet.previewHighlight")}
            </span>
            <span className="text-xs" style={{ color: settings.colorHaze }}>
              {t("adminSet.previewMuted")}
            </span>
          </div>
        </div>
      </Section>

      {/* ---------------- ANNOUNCEMENT ---------------- */}
      <Section title={t("adminSet.announcement")} hint={t("adminSet.announcementHint")}>
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="announcementOn"
              defaultChecked={settings.announcementOn}
              className="h-4 w-4 accent-fg"
            />
            {t("adminSet.showAnnouncement")}
          </label>
          <Input
            label={t("adminSet.announcementText")}
            name="announcementText"
            defaultValue={settings.announcementText}
          />
        </div>
      </Section>

      {/* ---------------- HERO ---------------- */}
      <Section title={t("adminSet.hero")} hint={t("adminSet.heroHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("adminSet.kicker")} name="heroKicker" defaultValue={settings.heroKicker} />
          <div className="sm:col-span-2">
            <ImagePicker
              name="heroImage"
              label={t("adminSet.heroImage")}
              defaultValue={settings.heroImage}
              single
              hint={t("adminSet.heroImageHint")}
              locale={locale}
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label={t("adminSet.heroFit")}
              name="heroFit"
              defaultValue={settings.heroFit === "cover" ? "cover" : "contain"}
              hint={t("adminSet.heroFitHint")}
              options={[
                { value: "contain", label: t("adminSet.heroFitContain") },
                { value: "cover", label: t("adminSet.heroFitCover") },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.headline")}
              name="heroTitle"
              defaultValue={settings.heroTitle}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label={t("adminSet.supportingCopy")}
              name="heroBody"
              defaultValue={settings.heroBody}
              rows={3}
            />
          </div>
          <Input
            label={t("adminSet.buttonText")}
            name="heroCtaText"
            defaultValue={settings.heroCtaText}
          />
          <Input
            label={t("adminSet.buttonLink")}
            name="heroCtaHref"
            defaultValue={settings.heroCtaHref}
          />
          <Input
            label={t("adminSet.secondaryButtonText")}
            name="heroSecondaryText"
            defaultValue={settings.heroSecondaryText}
          />
          <Input
            label={t("adminSet.secondaryButtonLink")}
            name="heroSecondaryHref"
            defaultValue={settings.heroSecondaryHref}
          />
        </div>
      </Section>

      {/* ---------------- VIDEO & GALLERY ---------------- */}
      <Section title={t("adminSet.videoLookbook")} hint={t("adminSet.videoLookbookHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImagePicker
              name="heroVideo"
              label={t("adminSet.heroVideo")}
              kind="video"
              defaultValue={settings.heroVideo}
              single
              hint={t("adminSet.heroVideoHint")}
              locale={locale}
            />
          </div>
          <div className="sm:col-span-2">
            <ImagePicker
              name="videoPoster"
              label={t("adminSet.videoPoster")}
              defaultValue={settings.videoPoster}
              single
              hint={t("adminSet.videoPosterHint")}
              locale={locale}
            />
          </div>
          <div className="sm:col-span-2">
            <ImagePicker
              name="galleryImages"
              label={t("adminSet.galleryImages")}
              defaultValue={parseList(settings.galleryImages).join(", ")}
              hint={t("adminSet.galleryImagesHint")}
              locale={locale}
            />
          </div>
        </div>
      </Section>

      {/* ---------------- INTERNATIONAL ---------------- */}
      <Section
        title={t("adminSet.contactLocation")}
        hint={t("adminSet.contactLocationHint")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="whatsappOn"
              defaultChecked={settings.whatsappOn}
              className="h-4 w-4 accent-fg"
            />
            {t("adminSet.showWhatsapp")}
          </label>
          <div />
          <Input
            label={t("adminSet.whatsappNumber")}
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            placeholder="0788123456"
            hint={t("adminSet.whatsappNumberHint")}
          />
          <Input
            label={t("adminSet.phoneNumber")}
            name="phoneNumber"
            defaultValue={settings.phoneNumber}
            placeholder="+250 788 000 000"
          />
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.whatsappMessage")}
              name="whatsappMessage"
              defaultValue={settings.whatsappMessage}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.shopAddress")}
              name="mapAddress"
              defaultValue={settings.mapAddress}
              placeholder="KN 5 Ave, Kigali, Rwanda"
              hint={t("adminSet.shopAddressHint")}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.mapEmbed")}
              name="mapEmbedUrl"
              defaultValue={settings.mapEmbedUrl}
              placeholder="https://www.google.com/maps/embed?pb=..."
              hint={t("adminSet.mapEmbedHint")}
            />
          </div>
          <Input
            label={t("adminSet.instagramUrl")}
            name="instagramUrl"
            defaultValue={settings.instagramUrl}
          />
          <Input label={t("adminSet.tiktokUrl")} name="tiktokUrl" defaultValue={settings.tiktokUrl} />
          <Input
            label={t("adminSet.facebookUrl")}
            name="facebookUrl"
            defaultValue={settings.facebookUrl}
          />
        </div>
      </Section>

      {/* ---------------- STORY ---------------- */}
      <Section title={t("adminSet.story")} hint={t("adminSet.storyHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("adminSet.kicker")} name="storyKicker" defaultValue={settings.storyKicker} />
          <div className="sm:col-span-2">
            <ImagePicker
              name="storyImage"
              label={t("adminSet.storyImage")}
              defaultValue={settings.storyImage}
              single
              locale={locale}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.headline")}
              name="storyTitle"
              defaultValue={settings.storyTitle}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label={t("adminSet.body")}
              name="storyBody"
              defaultValue={settings.storyBody}
              rows={4}
            />
          </div>
        </div>
      </Section>

      {/* ---------------- LISTS ---------------- */}
      <Section title={t("adminSet.valueProps")} hint={t("adminSet.valuePropsHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label={t("adminSet.valuePropsLabel")}
            name="valueProps"
            defaultValue={valueProps.join("\n")}
            rows={4}
          />
          <TextArea
            label={t("adminSet.categories")}
            name="categories"
            defaultValue={categories.join("\n")}
            rows={4}
          />
        </div>
      </Section>

      {/* ---------------- SHOP ---------------- */}
      <Section title={t("adminSet.shopPage")} hint={t("adminSet.shopPageHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.shopHeading")}
            name="shopTitle"
            defaultValue={settings.shopTitle}
          />
          <Input
            label={t("adminSet.shopDescription")}
            name="shopDescription"
            defaultValue={settings.shopDescription}
          />
        </div>
      </Section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <Section title={t("adminSet.newsletter")} hint={t("adminSet.newsletterHint")}>
        <div className="space-y-4">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="newsletterEnabled"
              defaultChecked={settings.newsletterEnabled}
              className="h-4 w-4 accent-fg"
            />
            {t("adminSet.showNewsletter")}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("adminSet.headline")}
              name="newsletterTitle"
              defaultValue={settings.newsletterTitle}
            />
            <Input
              label={t("adminSet.body")}
              name="newsletterBody"
              defaultValue={settings.newsletterBody}
            />
          </div>
        </div>
      </Section>

      {/* ---------------- FOOTER ---------------- */}
      <Section title={t("adminSet.footer")} hint={t("adminSet.footerHint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextArea
              label={t("adminSet.aboutText")}
              name="footerAbout"
              defaultValue={settings.footerAbout}
              rows={2}
            />
          </div>
          <Input
            label={t("adminSet.instagramUrl")}
            name="footerInstagram"
            defaultValue={settings.footerInstagram}
          />
          <Input label={t("adminSet.tiktokUrl")} name="footerTiktok" defaultValue={settings.footerTiktok} />
          <Input label={t("adminSet.email")} name="footerEmail" defaultValue={settings.footerEmail} />
          <Input label={t("adminSet.address")} name="footerAddress" defaultValue={settings.footerAddress} />
        </div>
      </Section>

      {/* ---------------- COMMERCE ---------------- */}
      <Section title={t("adminSet.shippingStock")} hint={t("adminSet.shippingStockHint")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label={t("adminSet.currencyCode")}
            name="currency"
            defaultValue={settings.currency}
            hint={t("adminSet.currencyCodeHint")}
          />
          <Input
            label={t("adminSet.flatShipping")}
            name="shippingFlat"
            type="number"
            step="1"
            min="0"
            defaultValue={(settings.shippingFlatCents / 100).toFixed(0)}
          />
          <Input
            label={t("adminSet.freeShippingOver")}
            name="freeShippingOver"
            type="number"
            step="1"
            min="0"
            defaultValue={(settings.freeShippingOverCents / 100).toFixed(0)}
          />
          <Input
            label={t("adminSet.lowStockAlert")}
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={settings.lowStockThreshold}
          />
        </div>
      </Section>

      {/* ---------------- FRENCH OVERRIDES ---------------- */}
      {/* Kept as one block at the end rather than a second field beside each
          English one: the site copy is long, and grouping it here is the only
          way to see at a glance what still has no French version. */}
      <Section title={t("adminSet.french")} hint={t("adminSet.frenchHint")}>
        <p className="mb-5 rounded border border-line bg-surface-2 p-3 text-xs text-fg/70">
          {t("adminSet.frenchFallback")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.tagline")}
            name="taglineFr"
            defaultValue={settings.taglineFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.announcementText")}
            name="announcementTextFr"
            defaultValue={settings.announcementTextFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <div className="sm:col-span-2">
            <Input
              label={t("adminSet.whatsappMessage")}
              name="whatsappMessageFr"
              defaultValue={settings.whatsappMessageFr ?? ""}
              hint={t("adminSet.frenchOptional")}
            />
          </div>
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.hero")}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.kicker")}
            name="heroKickerFr"
            defaultValue={settings.heroKickerFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.headline")}
            name="heroTitleFr"
            defaultValue={settings.heroTitleFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <div className="sm:col-span-2">
            <TextArea
              label={t("adminSet.supportingCopy")}
              name="heroBodyFr"
              rows={2}
              defaultValue={settings.heroBodyFr ?? ""}
              hint={t("adminSet.frenchOptional")}
            />
          </div>
          <Input
            label={t("adminSet.buttonText")}
            name="heroCtaTextFr"
            defaultValue={settings.heroCtaTextFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.secondaryButtonText")}
            name="heroSecondaryTextFr"
            defaultValue={settings.heroSecondaryTextFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.story")}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.kicker")}
            name="storyKickerFr"
            defaultValue={settings.storyKickerFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.headline")}
            name="storyTitleFr"
            defaultValue={settings.storyTitleFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <div className="sm:col-span-2">
            <TextArea
              label={t("adminSet.body")}
              name="storyBodyFr"
              rows={4}
              defaultValue={settings.storyBodyFr ?? ""}
              hint={t("adminSet.frenchOptional")}
            />
          </div>
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.valueProps")}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <TextArea
            label={t("adminSet.valuePropsLabel")}
            name="valuePropsFr"
            rows={4}
            defaultValue={parseList(settings.valuePropsFr).join("\n")}
            hint={t("adminSet.valuePropsFrHint")}
          />
          <TextArea
            label={t("adminSet.categories")}
            name="categoriesFr"
            rows={4}
            defaultValue={parseList(settings.categoriesFr).join("\n")}
            hint={t("adminSet.categoriesFrHint")}
          />
        </div>
        <p className="mt-3 text-xs text-fg/65">{t("adminSet.frenchListOrder")}</p>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.shopPage")}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.shopHeading")}
            name="shopTitleFr"
            defaultValue={settings.shopTitleFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.shopDescription")}
            name="shopDescriptionFr"
            defaultValue={settings.shopDescriptionFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.newsletter")}
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Input
            label={t("adminSet.headline")}
            name="newsletterTitleFr"
            defaultValue={settings.newsletterTitleFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
          <Input
            label={t("adminSet.body")}
            name="newsletterBodyFr"
            defaultValue={settings.newsletterBodyFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
        </div>

        <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-fg/65">
          {t("adminSet.footer")}
        </h3>
        <div className="mt-3">
          <TextArea
            label={t("adminSet.aboutText")}
            name="footerAboutFr"
            rows={2}
            defaultValue={settings.footerAboutFr ?? ""}
            hint={t("adminSet.frenchOptional")}
          />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10">
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-fg bg-inverse px-5 py-4 text-inverse-fg shadow-lg">
          <p className="text-xs text-inverse-fg/80">{t("adminSet.liveNote")}</p>
          <button type="submit" disabled={pending} className="btn btn-volt">
            {pending ? t("adminSet.saving") : t("adminSet.saveAll")}
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

function ColorInput({
  locale,
  label,
  name,
  value,
}: {
  locale: Locale;
  label: string;
  name: string;
  value: string;
}) {
  const t = makeTranslator(locale);
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
          aria-label={t("adminSet.colourPicker", { name: label })}
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