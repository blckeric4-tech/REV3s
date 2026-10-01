import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { getSettings, getCategories } from "@/lib/settings";
import { formatMoney } from "@/lib/money";
import {
  deleteProduct,
  quickStockUpdate,
  toggleFeatured,
  toggleProductActive,
} from "@/app/admin/actions";
import { getTranslator } from "@/lib/i18n";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const category = sp.category ?? "";

  const [settings, categories, products, { t }] = await Promise.all([
    getSettings(),
    getCategories(),
    db.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(query ? { name: { contains: query } } : {}),
      },
      include: { variants: { orderBy: [{ size: "asc" }, { color: "asc" }] } },
      orderBy: { createdAt: "desc" },
    }),
    getTranslator(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs text-fg/65">{t("admin.catalogue")}</p>
          <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">
            {t("admin.products")}
          </h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          {t("admin.newProduct")}
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={query}
          placeholder={t("admin.searchProducts")}
          aria-label={t("admin.searchProducts")}
          className="field w-full max-w-xs"
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <select
          name="category"
          defaultValue={category}
          aria-label={t("shop.filterCategory")}
          className="field w-auto"
        >
          <option value="">{t("shop.allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-outline">
          {t("admin.filter")}
        </button>
      </form>

      {products.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line py-16 text-center text-sm text-fg/65">
          No products match.{" "}
          <Link href="/admin/products/new" className="underline underline-offset-4">
            Create one
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => {
            const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
            const low = p.variants.filter((v) => v.stock <= settings.lowStockThreshold);

            return (
              <li key={p.id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                  <Link
                    href={`/product/${p.slug}`}
                    target="_blank"
                    className="media-mat relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-line"
                  >
                    <Image src={p.image} alt={p.name} fill sizes="5rem" className="media-fit" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-sm font-bold hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.badge ? (
                        <span className="label-xs rounded-full bg-inverse px-2 py-1 text-inverse-fg">
                          {p.badge}
                        </span>
                      ) : null}
                      {!p.active ? (
                        <span className="label-xs rounded-full border border-line px-2 py-1 text-fg/65">
                          {t("admin.hidden")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-fg/65">/{p.slug}</p>
                    <p className="mt-1.5 text-xs text-fg/70">
                      {p.category} &middot; {formatMoney(p.priceCents, settings.currency)} &middot;{" "}
                      {p.variants.length} {t("admin.variants")} &middot; {totalStock}{" "}
                      {t("admin.stock")}
                      {low.length > 0 ? (
                        <span className="ml-1 font-semibold text-fg">
                          ({low.length} {t("admin.low")})
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="label-xs border border-line px-3 py-2 hover:border-fg">
                        {p.active ? t("admin.hide") : t("admin.show")}
                      </button>
                    </form>
                    <form action={toggleFeatured}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className={`label-xs border px-3 py-2 ${
                          p.featured
                            ? "border-fg bg-fg text-bg"
                            : "border-line hover:border-fg"
                        }`}
                      >
                        {t("admin.featured")}
                      </button>
                    </form>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="label-xs border border-line px-3 py-2 hover:border-fg"
                    >
                      {t("common.edit")}
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="label-xs border border-line px-3 py-2 hover:border-fg hover:text-fg"
                      >
                        {t("common.delete")}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Inline stock editor */}
                <div className="border-t border-line bg-surface/60 px-4 py-3">
                  <p className="label-xs mb-2.5 text-fg/70">{t("admin.stockByVariant")}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.variants.map((v) => (
                      <form
                        key={v.id}
                        action={quickStockUpdate}
                        className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1"
                      >
                        <input type="hidden" name="variantId" value={v.id} />
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-fg/15"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span className="text-[11px] text-fg/70">
                          {v.size}/{v.color}
                        </span>
                        <input
                          type="number"
                          name="stock"
                          defaultValue={v.stock}
                          min={0}
                          aria-label={`Stock for ${p.name} ${v.color} ${v.size}`}
                          className="w-12 rounded border border-transparent bg-surface px-1.5 py-0.5 text-center text-xs font-semibold focus:border-fg"
                        />
                        <button
                          type="submit"
                          className="text-[10px] uppercase tracking-wider text-fg/70 hover:text-fg"
                        >
                          {t("admin.set")}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
