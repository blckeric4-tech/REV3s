import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/settings";
import { getTranslator } from "@/lib/i18n";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("admin.newProduct") };
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ t, locale }, sp, categories] = await Promise.all([
    getTranslator(),
    searchParams,
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="label-xs text-fg/65 hover:text-fg">
          &larr; {t("admin.products")}
        </Link>
        <h1 className="mt-3 text-3xl font-black uppercase md:text-4xl">
          {t("admin.newProduct")}
        </h1>
      </div>

      <ProductForm
        saved={sp.saved === "1"}
        categories={categories}
        locale={locale}
        seed={{
          name: "",
          slug: "",
          tagline: "",
          description: "",
          price: "",
          comparePrice: "",
          category: categories[0] ?? "T-Shirts",
          badge: "",
          image: "/images/products/core-heavyweight-tee-1.svg",
          images: "",
          onBodyImages: "",
          nameFr: "",
          taglineFr: "",
          descriptionFr: "",
          badgeFr: "",
          featured: false,
          active: true,
          variants: [],
        }}
      />
    </div>
  );
}