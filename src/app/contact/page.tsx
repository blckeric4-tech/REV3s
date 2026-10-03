import type { Metadata } from "next";
import { getLocalizedSettings } from "@/lib/settings";
import { GoogleMap } from "@/components/google-map";
import { whatsappLink, phoneHref } from "@/lib/contact";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("contact.meta") };
}

export default async function ContactPage() {
  const [{ t, locale }] = await Promise.all([getTranslator()]);
  const s = await getLocalizedSettings(locale);

  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">{t("contact.kicker")}</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">{t("contact.title")}</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg/65">{t("contact.body")}</p>

      {/* Quick actions */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {s.whatsappOn && s.whatsappNumber ? (
          <a
            href={whatsappLink(s.whatsappNumber, s.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
          >
            <p className="label-xs text-fg/65">{t("contact.fastest")}</p>
            <p className="mt-3 text-xl font-black uppercase">{t("contact.whatsapp")}</p>
            <p className="mt-2 text-sm text-fg/70">{s.whatsappNumber}</p>
          </a>
        ) : null}

        {s.phoneNumber ? (
          <a
            href={phoneHref(s.phoneNumber)}
            className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
          >
            <p className="label-xs text-fg/65">{t("contact.workshop")}</p>
            <p className="mt-3 text-xl font-black uppercase">{t("contact.callUs")}</p>
            <p className="mt-2 text-sm text-fg/70">{s.phoneNumber}</p>
          </a>
        ) : null}

        {s.footerEmail ? (
          <a
            href={`mailto:${s.footerEmail}`}
            className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
          >
            <p className="label-xs text-fg/65">{t("contact.email")}</p>
            <p className="mt-3 text-xl font-black uppercase">{t("contact.writeToUs")}</p>
            <p className="mt-2 break-all text-sm text-fg/70">{s.footerEmail}</p>
          </a>
        ) : null}
      </div>

      {/* Map */}
      {s.mapAddress || s.mapEmbedUrl ? (
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-xs text-fg/65">{t("contact.whereWeAre")}</p>
              <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">{t("contact.findWorkshop")}</h2>
            </div>
            {s.mapAddress ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                {t("contact.openInMaps")}
              </a>
            ) : null}
          </div>

          {s.mapAddress ? (
            <p className="mt-4 text-sm text-fg/70">{s.mapAddress}</p>
          ) : null}

          <GoogleMap
            className="mt-6"
            embedUrl={s.mapEmbedUrl}
            address={s.mapAddress}
            title={t("map.brandLocation", { name: s.siteName })}
            locale={locale}
          />
        </section>
      ) : null}

      {/* Socials + FAQ */}
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="label-xs text-fg/65">{t("contact.followAlong")}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              [s.footerInstagram, "Instagram"],
              [s.footerTiktok, "TikTok"],
              [s.facebookUrl, "Facebook"],
            ]
              .filter(([href]) => href)
              .map(([href, label]) => (
                <a
                  key={String(label)}
                  href={String(href)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-outline"
                >
                  {label}
                </a>
              ))}
          </div>

          <h2 className="label-xs mt-10 text-fg/65">{t("contact.delivery")}</h2>
          <p className="mt-3 text-sm text-fg/70">{s.footerAddress}</p>
        </div>

        <div className="card p-6">
          <h2 className="label-xs text-fg/65">{t("contact.commonQuestions")}</h2>
          <dl className="mt-4 space-y-5 text-sm">
            <div>
              <dt className="font-semibold">{t("contact.q1")}</dt>
              <dd className="mt-1 text-fg/65">{t("contact.a1")}</dd>
            </div>
            <div>
              <dt className="font-semibold">{t("contact.q2")}</dt>
              <dd className="mt-1 text-fg/65">{t("contact.a2")}</dd>
            </div>
            <div>
              <dt className="font-semibold">{t("contact.q3")}</dt>
              <dd className="mt-1 text-fg/65">{t("contact.a3")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
