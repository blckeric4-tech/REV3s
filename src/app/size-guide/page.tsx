import type { Metadata } from "next";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("sizeGuide.title") };
}

const ROWS: { size: string; chest: string; length: string; shoulder: string }[] = [
  { size: "XS", chest: "84–89 cm", length: "66 cm", shoulder: "42 cm" },
  { size: "S", chest: "90–95 cm", length: "69 cm", shoulder: "44 cm" },
  { size: "M", chest: "96–101 cm", length: "72 cm", shoulder: "46 cm" },
  { size: "L", chest: "102–107 cm", length: "74 cm", shoulder: "48 cm" },
  { size: "XL", chest: "108–115 cm", length: "76 cm", shoulder: "50 cm" },
  { size: "XXL", chest: "116–123 cm", length: "78 cm", shoulder: "52 cm" },
];

export default async function SizeGuidePage() {
  const { t } = await getTranslator();

  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">{t("sizeGuide.kicker")}</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">
        {t("sizeGuide.title")}
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg/65">
        {t("sizeGuide.body")}
      </p>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-fg text-left">
              <th className="py-3 pr-4">{t("sizeGuide.size")}</th>
              <th className="py-3 pr-4">{t("sizeGuide.chest")}</th>
              <th className="py-3 pr-4">{t("sizeGuide.length")}</th>
              <th className="py-3">{t("sizeGuide.shoulder")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size} className="border-b border-line">
                <td className="py-3.5 pr-4 font-semibold">{r.size}</td>
                <td className="py-3.5 pr-4 text-fg/70">{r.chest}</td>
                <td className="py-3.5 pr-4 text-fg/70">{r.length}</td>
                <td className="py-3.5 text-fg/70">{r.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-fg/70">{t("sizeGuide.footer")}</p>
    </div>
  );
}