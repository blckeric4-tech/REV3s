import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { parseList } from "@/lib/money";
import { SettingsForm } from "@/components/admin/settings-form";
import { PasswordForm } from "@/components/admin/password-form";
import { db } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("admin.metaSettings") };
}
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; warn?: string }>;
}) {
  const [sp, settings, subscribers, { t, locale, tag }] = await Promise.all([
    searchParams,
    getSettings(),
    db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    getTranslator(),
  ]);

  const categories = parseList(settings.categories);
  const valueProps = parseList(settings.valueProps);
  const warnings = (sp.warn ?? "").split(" | ").filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-xs text-fg/65">{t("admin.everythingInOnePlace")}</p>
        <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">
          {t("admin.siteEditor")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-fg/70">{t("adminSet.introBody")}</p>
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface-2 p-4">
          <p className="text-sm font-semibold">
            {warnings.length === 1
              ? t("adminSet.imagesNotAddedOne")
              : t("adminSet.imagesNotAddedMany", { count: warnings.length })}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-fg/70">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : sp.saved === "1" ? (
        <p className="rounded-[var(--radius-card)] bg-fg px-4 py-3 text-sm font-semibold">
          {t("adminSet.savedLive")}
        </p>
      ) : null}

      <SettingsForm
        settings={settings}
        categories={categories}
        valueProps={valueProps}
        locale={locale}
      />

      <section className="card p-5">
        <h2 className="label-xs text-fg/65">
          {t("admin.subscribers")} ({subscribers.length})
        </h2>
        {subscribers.length === 0 ? (
          <p className="mt-3 text-sm text-fg/65">{t("admin.noSubscribers")}</p>
        ) : (
          <ul className="mt-4 max-h-64 space-y-1.5 overflow-y-auto">
            {subscribers.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 border-b border-line/60 py-1.5 text-sm"
              >
                <span className="truncate">{s.email}</span>
                <span className="shrink-0 text-xs text-fg/70">
                  {new Date(s.createdAt).toLocaleDateString(tag)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="label-xs text-fg/65">{t("admin.changePassword")}</h2>
        <div className="mt-4 max-w-md">
          <PasswordForm locale={locale} />
        </div>
      </section>
    </div>
  );
}
