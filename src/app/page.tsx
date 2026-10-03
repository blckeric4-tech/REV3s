import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/prisma";
import {
  getLocalizedSettings,
  getLocalizedValueProps,
  getLocalizedCategories,
} from "@/lib/settings";
import { parseList, formatMoney } from "@/lib/money";
import { localizeProduct } from "@/lib/localize";
import { AutoRail } from "@/components/auto-rail";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";
import { whatsappLink } from "@/lib/contact";
import { getTranslator } from "@/lib/i18n";

export default async function HomePage() {
  const [{ t, locale, tag }] = await Promise.all([getTranslator()]);
  const [settings, valueProps, categories, products] = await Promise.all([
    getLocalizedSettings(locale),
    getLocalizedValueProps(locale),
    getLocalizedCategories(locale),
    db.product.findMany({
      where: { active: true },
      include: { variants: { select: { color: true, colorHex: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  const gallery = parseList(settings.galleryImages);
  const galleryFrames = gallery.length
    ? gallery
    : [
        "/images/hero.svg",
        "/images/story.svg",
        "/images/products/core-heavyweight-tee-1.svg",
        "/images/products/heavy-fleece-hoodie-1.svg",
        "/images/products/waxed-work-jacket-1.svg",
        "/images/products/cable-knit-jumper-1.svg",
        "/images/products/boxy-pocket-tee-1.svg",
        "/images/products/oversized-zip-hoodie-1.svg",
      ];

  // Admin choice: "contain" shows the whole uploaded photo, "cover" fills the
  // frame and crops the edges. These MUST be written out as whole literals —
  // Tailwind's scanner only sees static class names, so `object-${heroFit}`
  // would never produce any CSS at all.
  const heroFitClass = settings.heroFit === "cover" ? "media-fill" : "media-fit";
  const heroScrim =
    settings.heroFit === "cover"
      ? "absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25"
      : "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent";

  return (
    <>
      {/* ─────────── VIDEO / IMAGE HERO ─────────── */}
      <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-inverse text-inverse-fg">
        <div className="absolute inset-0 -z-10">
          {settings.heroVideo ? (
            <video
              className={`mono-media h-full w-full ${heroFitClass}`}
              src={settings.heroVideo}
              poster={settings.videoPoster || settings.heroImage || "/images/hero.svg"}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={settings.heroImage || "/images/hero.svg"}
              alt={settings.heroTitle}
              fill
              sizes="100vw"
              className={`mono-media ${heroFitClass}`}
              preload
            />
          )}
          {/* A contained photo leaves bars that already separate the copy from
              the image, so it only needs a light scrim. */}
          <div className={heroScrim} />
        </div>

        <div className="container-rav3s w-full py-20 md:py-28">
          {settings.heroKicker ? (
            <p className="label-xs inline-flex items-center gap-2 text-inverse-fg/85">
              <span className="h-1.5 w-1.5 animate-[var(--animate-pulse-dot)] rounded-full bg-inverse-fg" />
              {settings.heroKicker}
            </p>
          ) : null}

          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,9vw,7rem)] font-black uppercase leading-[0.88]">
            {settings.heroTitle}
          </h1>

          {settings.heroBody ? (
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-inverse-fg/85 sm:text-base">
              {settings.heroBody}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href={settings.heroCtaHref || "/shop"} className="btn btn-invert px-8 py-4">
              {settings.heroCtaText || t("home.orderOnline")}
            </Link>
            {settings.heroSecondaryText ? (
              <Link
                href={settings.heroSecondaryHref || "/shop"}
                className="btn btn-inverse-outline px-8 py-4"
              >
                {settings.heroSecondaryText}
              </Link>
            ) : null}
            {settings.whatsappNumber ? (
              <a
                href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-inverse-outline px-8 py-4"
              >
                {t("home.orderOnWhatsapp")}
              </a>
            ) : null}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <span className="label-xs block text-inverse-fg/75">{t("home.scroll")}</span>
          <span className="mx-auto mt-2 block h-10 w-px bg-inverse-fg/40" />
        </div>
      </section>

      {/* ─────────── SCROLLING PHOTO STRIP ─────────── */}
      <section
        className="overflow-hidden border-b border-line bg-inverse py-6"
        aria-label={t("home.galleryStrip")}
      >
        <div className="flex w-max animate-[var(--animate-marquee)] gap-3">
          {[...galleryFrames, ...galleryFrames].map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="media-mat-inverse relative h-28 w-20 shrink-0 overflow-hidden rounded-md border border-inverse/20 sm:h-36 sm:w-28"
            >
              {/* media-fit = object-contain, so an uploaded photo is never
                  cropped. The black mat behind it is part of the brand. */}
              <Image src={src} alt="" fill sizes="112px" className="mono-media media-fit" />
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── VALUE PROPS ─────────── */}
      {valueProps.length > 0 ? (
        <section className="border-b border-line">
          <div className="container-rav3s grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((prop, i) => (
              <Reveal
                key={prop}
                delay={i * 70}
                className="border-b border-line px-1 py-6 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">{prop}</p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─────────── THE HORIZONTAL CLOTHES RAIL ─────────── */}
      <section className="py-20 md:py-28">
        <div className="container-rav3s">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-xs text-fg/65">{t("home.scrollRail")}</p>
              <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
                {t("home.theDropLead")}{" "}
                <span className="outline-type">{t("home.theDropWord")}</span>
              </h2>
            </div>
            <Link href="/shop" className="btn btn-primary">
              {t("home.orderOnlineArrow")}
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="container-rav3s mt-12 text-sm text-fg/65">
            {t("home.noProducts")}
          </p>
        ) : (
          <div className="mt-12">
            <AutoRail duration={50} locale={locale}>
              {products.map((p) => {
                const copy = localizeProduct(p, locale);
                return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group w-[16rem] shrink-0 p-2 sm:w-[19rem]"
                >
                  <div className="media-mat relative aspect-3/4 overflow-hidden rounded-[var(--radius-card)] border border-line">
                    <Image
                      src={p.image}
                      alt={copy.name}
                      fill
                      sizes="(max-width: 640px) 256px, 304px"
                      className="media-fit transition-transform duration-500 group-hover:scale-105"
                    />
                    {copy.badge ? (
                      <span className="label-xs absolute left-3 top-3 rounded-full bg-inverse px-3 py-1.5 text-inverse-fg">
                        {copy.badge}
                      </span>
                    ) : null}
<span className="label-xs absolute bottom-3 right-3 rounded-full bg-surface px-3 py-1.5 text-fg opacity-0 transition-opacity group-hover:opacity-100">
                       {t("home.view")}
                     </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
                    <p className="truncate text-sm font-semibold uppercase">{copy.name}</p>
                    <p className="shrink-0 text-sm">
                      {formatMoney(p.priceCents, settings.currency, tag)}
                    </p>
                  </div>
                </Link>
                );
              })}
            </AutoRail>
          </div>
        )}
      </section>

      {/* ─────────── CATEGORIES ─────────── */}
      {categories.length > 0 ? (
        <section className="section-ink py-20 md:py-24">
          <div className="container-rav3s">
            <p className="label-xs text-inverse-fg/70">{t("home.shopByCategory")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.key}
                  href={`/shop?category=${encodeURIComponent(c.key)}`}
                  className="group flex items-center gap-3 rounded-full border border-inverse/25 px-6 py-3 transition-colors hover:bg-surface hover:text-fg"
                >
                  <span className="label-xs">{c.label}</span>
                  <span className="text-inverse-fg/70 transition-transform group-hover:translate-x-1 group-hover:text-inverse-fg">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────── STORY ─────────── */}
      <section className="container-rav3s py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal className="media-mat relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)] border border-line">
            <Image
              src={settings.storyImage || "/images/story.svg"}
              alt={t("about.workshopAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="mono-media media-fit"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="label-xs text-fg/65">{settings.storyKicker}</p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[1.05] md:text-4xl">
              {settings.storyTitle}
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-fg/70 md:text-base">
              {settings.storyBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-primary">
                {t("home.readStory")}
              </Link>
              <Link href="/shop" className="btn btn-outline">
                {t("home.shopLabel")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────── LOOKBOOK ─────────── */}
      <section className="container-rav3s pb-20 md:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label-xs text-fg/65">{t("home.inTheWild")}</p>
            <h2 className="mt-3 text-3xl font-black uppercase md:text-4xl">
              {t("home.lookbook")}
            </h2>
          </div>
          <Link href="/shop" className="btn btn-outline">
            {t("home.orderOnline")}
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {galleryFrames.slice(0, 8).map((src, i) => (
            <Reveal
              key={`${src}-lb-${i}`}
              delay={i * 60}
              className={`media-mat relative overflow-hidden rounded-[var(--radius-card)] border border-line ${
                i % 5 === 0 ? "aspect-3/4 md:row-span-2" : "aspect-square"
              }`}
            >
              <Image
                src={src}
                alt={t("home.lookbookAlt")}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="mono-media media-fit"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────── WHATSAPP ORDER BAND ─────────── */}
      {settings.whatsappOn && settings.whatsappNumber ? (
        <section className="section-ink py-16 md:py-20">
          <div className="container-rav3s flex flex-col items-center text-center">
            <p className="label-xs text-inverse-fg/70">{t("home.preferToTalk")}</p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight md:text-5xl">
              {t("home.orderOnWhatsapp")}
            </h2>
            <p className="mt-5 max-w-md text-sm text-inverse-fg/85">
              {t("home.whatsappBody")}
            </p>
            <a
              href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-invert mt-9 px-9 py-4"
            >
              {t("home.chatWithUs")}
            </a>
          </div>
        </section>
      ) : null}

      {/* ─────────── NEWSLETTER ─────────── */}
      {settings.newsletterEnabled ? (
        <section className="container-rav3s py-20 md:py-24">
          <div className="rounded-[var(--radius-card)] border border-line px-6 py-14 text-center md:px-16 md:py-20">
            <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">
              {settings.newsletterTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-fg/70">{settings.newsletterBody}</p>
            <NewsletterForm className="mx-auto mt-8 max-w-md" locale={locale} />
          </div>
        </section>
      ) : null}
    </>
  );
}
