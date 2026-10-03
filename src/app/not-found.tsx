import Link from "next/link";
import { getTranslator } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <div className="container-rav3s flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="label-xs text-fg/65">404</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">{t("notFound.title")}</h1>
      <p className="mt-4 max-w-md text-sm text-fg/70">{t("notFound.body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">{t("notFound.backHome")}</Link>
        <Link href="/shop" className="btn btn-outline">{t("notFound.browse")}</Link>
      </div>
    </div>
  );
}