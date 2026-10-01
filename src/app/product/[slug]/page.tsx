import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { VariantPicker } from "@/components/variant-picker";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.tagline ?? product.description.slice(0, 150) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [settings, product] = await Promise.all([
    getSettings(),
    db.product.findFirst({
      where: { slug, active: true },
      include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
    }),
  ]);

  if (!product) notFound();

  const images = (product.images ? product.images.split(",") : [])
    .map((s) => s.trim())
    .filter(Boolean);
  const flat = [product.image, ...images].filter(Boolean);

  const onBody = (product.onBodyImages ? product.onBodyImages.split(",") : [])
    .map((s) => s.trim())
    .filter(Boolean);

  const related = await db.product.findMany({
    where: { active: true, category: product.category, NOT: { id: product.id } },
    include: { variants: { select: { color: true, colorHex: true } } },
    take: 4,
  });

  const fallback = await db.product.findMany({
    where: { active: true, NOT: { id: product.id } },
    include: { variants: { select: { color: true, colorHex: true } } },
    take: 4,
  });

  const suggestions = (related.length >= 4 ? related : fallback).slice(0, 4);

  return (
    <div className="container-rav3s py-10 md:py-14">
      <nav className="label-xs flex items-center gap-2 text-fg/65">
        <Link href="/" className="hover:text-fg">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-fg">Shop</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-fg"
        >
          {product.category}
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
                  alt={`${product.name} on its own, view ${i + 1}`}
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
                <p className="label-xs shrink-0 text-fg/65">Worn by a model</p>
                <span className="h-px flex-1 bg-line" />
                <span className="label-xs shrink-0 text-fg/70">Scroll</span>
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
                      alt={`${product.name} worn on a model, view ${i + 1}`}
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
            {product.badge ? (
              <span className="label-xs rounded-full bg-fg px-2.5 py-1.5 text-bg">
                {product.badge}
              </span>
            ) : null}
            <span className="label-xs text-fg/65">{product.category}</span>
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase leading-tight md:text-4xl">
            {product.name}
          </h1>
          {product.tagline ? (
            <p className="mt-2 text-sm text-fg/70">{product.tagline}</p>
          ) : null}

          <div className="mt-7">
            <VariantPicker
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex,
                stock: v.stock,
              }))}
              slug={product.slug}
              name={product.name}
              priceCents={product.priceCents}
              image={product.image}
              currency={settings.currency}
              lowStockThreshold={settings.lowStockThreshold}
            />
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <p className="label-xs text-fg/65">Details</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg/75">
              {product.description}
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 border-t border-line pt-8 text-sm text-fg/70">
            <li className="flex gap-3">
              <span className="text-fg">✦</span> Free shipping on orders over{" "}
              {settings.freeShippingOverCents > 0
                ? formatMoney(settings.freeShippingOverCents, settings.currency)
                : "the minimum"}
            </li>
            <li className="flex gap-3">
              <span className="text-fg">✦</span> 30-day returns on unworn pieces
            </li>
            <li className="flex gap-3">
              <span className="text-fg">✦</span> Small-batch, made to run out
            </li>
          </ul>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <section className="mt-24">
          <h2 className="text-2xl font-black uppercase">You might also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {suggestions.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                priceCents={p.priceCents}
                compareCents={p.compareCents}
                image={p.image}
                badge={p.badge}
                category={p.category}
                currency={settings.currency}
                colors={p.variants}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
