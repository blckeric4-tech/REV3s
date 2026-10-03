import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("shipping.title") };
}

export default async function ShippingPage() {
  const [{ t, tag }, s] = await Promise.all([getTranslator(), getSettings()]);

  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">{t("shipping.kicker")}</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">
        {t("shipping.title")}
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-black uppercase">{t("shipping.heading")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-fg/70">
            <li>
              {t("shipping.flatRate")}{" "}
              <strong>
                {s.shippingFlatCents === 0
                  ? t("shipping.free")
                  : formatMoney(s.shippingFlatCents, s.currency, tag)}
              </strong>
            </li>
            <li>
              {t("shipping.freeOver")}{" "}
              <strong>
                {formatMoney(s.freeShippingOverCents, s.currency, tag)}
              </strong>
            </li>
            <li>{t("shipping.leaves")}</li>
            <li>{t("shipping.tracked")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase">
            {t("shipping.returnsHeading")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-fg/70">
            <li>{t("shipping.returns30")}</li>
            <li>{t("shipping.emailFirst")}</li>
            <li>{t("shipping.refunds")}</li>
            <li>{t("shipping.saleItems")}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}