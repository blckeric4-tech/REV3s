import Link from "next/link";
import { db } from "@/lib/prisma";
import { getSettings, getCategories } from "@/lib/settings";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { SortSelect } from "@/components/sort-select";

export const metadata = { title: "Shop" };

type SP = Promise<Record<string, string | string[] | undefined>>;

const SORTS = {
  newest: { createdAt: "desc" as const },
  "price-asc": { priceCents: "asc" as const },
  "price-desc": { priceCents: "desc" as const },
  name: { name: "asc" as const },
};

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const query = typeof sp.q === "string" ? sp.q.trim() : "";

  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const products = await db.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { tagline: { contains: query } },
              { category: { contains: query } },
            ],
          }
        : {}),
    },
    include: { variants: { select: { color: true, colorHex: true } } },
    orderBy: SORTS[sort as keyof typeof SORTS] ?? SORTS.newest,
  });

  const buildHref = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    params.set("sort", sort);
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="container-rav3s py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="label-xs text-fg/65">{settings.shopDescription}</p>
        <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
          {category || settings.shopTitle}
        </h1>
      </header>

      <div className="mt-10 flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          <FilterChip href={buildHref({ category: "" })} active={!category}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c}
              href={buildHref({ category: c })}
              active={category === c}
            >
              {c}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <SearchBar defaultValue={query} />
          <SortSelect sort={sort} category={category} query={query} />
        </div>
      </div>

      <p className="mt-6 text-xs text-fg/65">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      {products.length === 0 ? (
        <div className="mt-16 border border-dashed border-line py-24 text-center">
          <p className="text-lg font-semibold">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fg/70">
            Try a different category, or clear your search.
          </p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Show everything
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products.map((p, i) => (
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
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`label-xs whitespace-nowrap rounded-full border px-4 py-2.5 transition-colors ${
        active
          ? "border-fg bg-inverse text-inverse-fg"
          : "border-line text-fg/65 hover:border-fg hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}
