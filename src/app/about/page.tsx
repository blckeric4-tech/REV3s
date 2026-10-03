import type { Metadata } from "next";
import Image from "next/image";
import { getLocalizedSettings } from "@/lib/settings";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("about.meta") };
}

export default async function AboutPage() {
  const [{ t, locale }] = await Promise.all([getTranslator()]);
  const s = await getLocalizedSettings(locale);

  return (
    <div>
      <section className="container-rav3s py-16 md:py-24">
        <p className="label-xs text-fg/65">{s.storyKicker}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[1.02] md:text-6xl">
          {s.storyTitle}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-fg/70">
          {s.storyBody}
        </p>
      </section>

      <section className="container-rav3s pb-16 md:pb-24">
        <div className="media-mat relative aspect-16/7 overflow-hidden rounded-[var(--radius-card)] border border-line">
          <Image
            src={s.storyImage || "/images/story.svg"}
            alt={t("about.workshopAlt")}
            fill
            sizes="100vw"
            className="mono-media media-fit"
          />
        </div>
      </section>

      <section className="bg-inverse py-16 text-inverse-fg md:py-24">
        <div className="container-rav3s grid gap-12 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-black uppercase">{t("about.fabric")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              {t("about.fabricBody")}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase">{t("about.runs")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              {t("about.runsBody")}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase">{t("about.promise")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              {t("about.promiseBody")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
