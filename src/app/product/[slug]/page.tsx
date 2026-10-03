import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getLocalizedSettings, getLocalizedCategories } from "@/lib/settings";
import { localizeProduct, localizeVariant } from "@/lib/localize";
import { VariantPicker } from "@/components/variant-picker";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/money";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { t, locale }] = await Promise.all([params, getTranslator()]);
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: t("product.notFound") };
  const copy = localizeProduct(product, locale);
  return { title: copy.name, description: copy.tagline ?? copy.description.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [{ t, locale, tag }, product] = await Promise.all([
    getTranslator(),
    db.product.findFirst({
      where: { slug, active: true },
      include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
    }),
  ]);

  if (!product) notFound();

  const [settings, categories, related, fallback] = await Promise.all([
    getLocalizedSettings(locale),
    getLocalizedCategories(locale),
    db.product.findMany({
      where: { active: true, category: product.category, NOT: { id: product.id } },
      include: {
        variants: { select: { color: true, colorFr: true, colorHex: true } },
      },
      take: 4,
    }),
    db.product.findMany({
      where: { active: true, NOT: { id: product.id } },
      include: {
        variants: { select: { color: true, colorFr: true, colorHex: true } },
      },
      take: 4,
    }),
  ]);

  const copy = localizeProduct(product, locale);
  const categoryLabel =
    categories.find((c) => c.key === product.category)?.label ?? product.category;

  const images = (product.images ? product.images.split(",") : [])
    .map((s) => s.trim())
    .filter(Boolean);
  const flat = [product.image, ...images].filter(Boolean);

  const onBody = (product.onBodyImages ? product.onBodyImages.split(",") : [])
    .map((s) => s.trim())
    .filter(Boolean);

  const suggestions = (related.length >= 4 ? related : fallback).slice(0, 4);

  return (
    <div className="container-rav3s py-10 md:py-14">
      <nav className="label-xs flex items-center gap-2 text-fg/65">
        <Link href="/" className="hover:text-fg">{t("product.home")}</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-fg">{t("nav.shop")}</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-fg"
        >
          {categoryLabel}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery — garment on its own, then worn by a model further down */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {flat.map((src, i) => (
              <div
                key={src}
                className={`media-mat relative aspect-4/5 overflow-hidden rounded-[var(--radius-card)] border border-line ${
                  flat.length === 1 ? "sm:col-span-2" : ""
                }`}
              >
                <Image
                  src={src}
                  alt={t("product.garmentAlt", { name: copy.name, n: i + 1 })}
                  fill
                  sizes="(max-width: 1024px) 50vw, 45vw"
                  className="media-fit"
                  preload={i === 0}
                />
              </div>
            ))}
          </div>

          {onBody.length > 0 ? (
            <div className="mt-14 md:mt-20">
              <div className="flex items-center gap-4">
                <p className="label-xs shrink-0 text-fg/65">{t("product.wornByModel")}</p>
                <span className="h-px flex-1 bg-line" />
                <span className="label-xs shrink-0 text-fg/70">{t("product.scrollLabel")}</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {onBody.map((src, i) => (
                  <div
                    key={src}
                    className={`media-mat relative aspect-3/4 overflow-hidden rounded-[var(--radius-card)] border border-line ${
                      onBody.length === 1 ? "sm:col-span-2 sm:aspect-4/5" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={t("product.wornAlt", { name: copy.name, n: i + 1 })}
                      fill
                      sizes="(max-width: 1024px) 50vw, 45vw"
                      className="media-fit"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Buy box */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3">
            {copy.badge ? (
              <span className="label-xs rounded-full bg-fg px-2.5 py-1.5 text-bg">
                {copy.badge}
              </span>
            ) : null}
            <span className="label-xs text-fg/65">{categoryLabel}</span>
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase leading-tight md:text-4xl">
            {copy.name}
          </h1>
          {copy.tagline ? (
            <p className="mt-2 text-sm text-fg/70">{copy.tagline}</p>
          ) : null}

          <div className="mt-7">
            <VariantPicker
              variants={product.variants}
              slug={product.slug}
              name={copy.name}
              priceCents={product.priceCents}
              image={product.image}
              currency={settings.currency}
              lowStockThreshold={settings.lowStockThreshold}
              locale={locale}
            />
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <p className="label-xs text-fg/65">{t("product.description")}</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg/75">
              {copy.description}
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 border-t border-line pt-8 text-sm text-fg/70">
            <li className="flex gap-3">
              <span className="text-fg">✦</span>{" "}
              {settings.freeShippingOverCents > 0
                ? t("product.freeShippingOver", {
                    amount: formatMoney(
                      settings.freeShippingOverCents,
                      settings.currency, tag
                    ),
                  })
                : t("product.freeShippingMin")}
            </li>
            <li className="flex gap-3">
              <span className="text-fg">✦</span> {t("product.returns")}
            </li>
            <li className="flex gap-3">
              <span className="text-fg">✦</span> {t("product.smallBatch")}
            </li>
          </ul>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <section className="mt-24">
          <h2 className="text-2xl font-black uppercase">{t("product.related")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {suggestions.map((p) => {
              const cardCopy = localizeProduct(p, locale);
              return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={cardCopy.name}
                priceCents={p.priceCents}
                compareCents={p.compareCents}
                image={p.image}
                badge={cardCopy.badge}
                category={p.category}
                categoryLabel={categories.find((c) => c.key === p.category)?.label}
                currency={settings.currency}
                colors={p.variants.map((v) => ({
                  ...localizeVariant(v, locale),
                  colorHex: v.colorHex,
                }))}
                locale={locale}
              />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
