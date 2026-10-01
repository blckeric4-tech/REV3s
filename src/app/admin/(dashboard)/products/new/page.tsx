import Link from "next/link";
import { getCategories } from "@/lib/settings";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="label-xs text-fg/65 hover:text-fg">
          &larr; Products
        </Link>
        <h1 className="mt-3 text-3xl font-black uppercase md:text-4xl">New product</h1>
      </div>

      <ProductForm
        saved={sp.saved === "1"}
        categories={categories}
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
          featured: false,
          active: true,
          variants: [],
        }}
      />
    </div>
  );
}
