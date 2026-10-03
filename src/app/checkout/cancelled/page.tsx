import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("checkout.cancelledMeta") };
}

export default async function CancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const { t } = await getTranslator();

  if (order) {
    await db.order
      .updateMany({ where: { orderNumber: order }, data: { status: "CANCELLED" } })
      .catch(() => undefined);
  }

  return (
    <div className="container-rav3s flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
        ✕
      </div>
      <h1 className="mt-8 text-4xl font-black uppercase md:text-5xl">{t("checkout.cancelledTitle")}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-fg/65">
        {t("checkout.cancelledBody")}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/cart" className="btn btn-primary">{t("checkout.returnToBag")}</Link>
        <Link href="/shop" className="btn btn-outline">{t("checkout.keepShopping")}</Link>
      </div>
    </div>
  );
}
