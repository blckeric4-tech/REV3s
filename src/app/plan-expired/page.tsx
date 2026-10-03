import type { Metadata } from "next";
import { getGraceWindow } from "@/lib/plan";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/contact";
import { formatMoney } from "@/lib/money";
import { getTranslator } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { AlertMark, PlanCountdown } from "@/components/plan-countdown";
import {
  ArrowRightIcon,
  CheckIcon,
  CreditCardIcon,
  ServerIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: t("plan.title"),
    description: t("plan.intro"),
    // Nothing to index here, and we would rather a search engine did not cache a
    // countdown that is stale the moment it is crawled.
    robots: { index: false, follow: false },
  };
}

/** Plain, checkable statements about what pausing does and does not do. */
const PAUSE_FACTS: TranslationKey[] = [
  "plan.pause1",
  "plan.pause2",
  "plan.pause3",
  "plan.pause4",
];

const UPGRADE_INCLUDES: TranslationKey[] = [
  "plan.upgrade1",
  "plan.upgrade2",
  "plan.upgrade3",
  "plan.upgrade4",
];

export default async function PlanExpiredPage() {
  const [{ t, locale, tag }, grace, settings] = await Promise.all([
    getTranslator(),
    getGraceWindow(),
    getSettings(),
  ]);

  const supportHref = whatsappLink(
    settings.whatsappNumber,
    t("plan.supportMessage"),
  );

  return (
    <div className="container-rav3s py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        {/* The one full-bleed red element on the site. Deliberately quiet:
            a tinted panel with a hairline border rather than a solid block, so
            it reads as a notice and not as an error the visitor caused. */}
        <div className="flex items-start gap-4 rounded-[--radius-card] border border-alert-line bg-alert-wash p-5 md:p-6">
          <AlertMark />
          <div>
            <p className="label-xs text-alert">{t("plan.actionRequired")}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-fg">
              {t("plan.actionBody")}
            </p>
          </div>
        </div>

        <header className="mt-10">
          <h1 className="text-4xl font-black uppercase md:text-5xl">
            {t("plan.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg/70">
            {t("plan.intro")}
          </p>
        </header>

        <section className="card mt-9 p-6 md:p-8">
          <p className="label-xs text-center text-fg/55">{t("plan.timerLabel")}</p>

          <div className="mt-5">
            <PlanCountdown
              initialRemainingMs={grace.remainingMs}
              windowMs={grace.windowMs}
              locale={locale}
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <h2 className="flex items-center gap-2.5 text-sm font-black uppercase">
              <ServerIcon className="h-4.5 w-4.5 text-fg/60" />
              {t("plan.pauseHeading")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fg/70">
              {PAUSE_FACTS.map((fact) => (
                <li key={fact} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-fg/40" />
                  <span>{t(fact)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2.5 text-sm font-black uppercase">
              <CheckIcon className="h-4.5 w-4.5 text-fg/60" />
              {t("plan.upgradeHeading")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fg/70">
              {UPGRADE_INCLUDES.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-fg/50" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Price and the single decision. The secondary action is deliberately
            below the fold line of the card rather than competing beside it. */}
        <section className="card mt-8 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="label-xs text-fg/55">{t("plan.paidPlan")}</p>
            <p className="mt-2 font-display text-4xl leading-none tracking-tight">
              {formatMoney(grace.priceRwf * 100, "rwf", tag)}
            </p>
            <p className="mt-2 text-xs text-fg/60">{t("plan.priceNote")}</p>
          </div>

          <a
            href={grace.billingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary shrink-0"
          >
            <CreditCardIcon className="h-4 w-4" />
            {t("plan.cta")}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </section>

        <footer className="mt-8 flex flex-col gap-4 border-t border-line pt-6 text-xs text-fg/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl leading-relaxed">{t("plan.disclaimer")}</p>
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline shrink-0"
          >
            {t("plan.support")}
          </a>
        </footer>
      </div>
    </div>
  );
}