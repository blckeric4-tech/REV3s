import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { getCategories } from "@/lib/settings";
import { ProductForm } from "@/components/admin/product-form";
import { getTranslator } from "@/lib/i18n";
import { deleteProduct } from "@/app/admin/actions";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("admin.metaEditProduct") };
}
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { t, locale } = await getTranslator();

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { variants: { orderBy: [{ size: "asc" }, { color: "asc" }] } },
    }),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/products" className="label-xs text-fg/65 hover:text-fg">
            &larr; {t("admin.products")}
          </Link>
          <h1 className="mt-3 text-3xl font-black uppercase md:text-4xl">{product.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="btn btn-outline"
          >
            {t("admin.viewLive")}
          </Link>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="btn btn-clay">
              {t("common.delete")}
            </button>
          </form>
        </div>
      </div>

      <ProductForm
        locale={locale}
        saved={sp.saved === "1"}
        categories={categories}
        seed={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline ?? "",
          description: product.description,
          price: (product.priceCents / 100).toFixed(2),
          comparePrice: product.compareCents ? (product.compareCents / 100).toFixed(2) : "",
          category: product.category,
          badge: product.badge ?? "",
          image: product.image,
          images: product.images ?? "",
          onBodyImages: product.onBodyImages ?? "",
          nameFr: product.nameFr ?? "",
          taglineFr: product.taglineFr ?? "",
          descriptionFr: product.descriptionFr ?? "",
          badgeFr: product.badgeFr ?? "",
          featured: product.featured,
          active: product.active,
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorFr: v.colorFr ?? "",
            colorHex: v.colorHex,
            stock: v.stock,
            sku: v.sku,
          })),
        }}
      />
    </div>
  );
}
