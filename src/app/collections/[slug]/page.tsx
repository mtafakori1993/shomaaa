import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { FilterSidebar, MobileFilters, SortSelect } from "@/components/shop/filters";
import { Pagination } from "@/components/shop/pagination";
import { ProductGrid } from "@/components/shop/product-card";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";
import { parseCollectionQuery } from "@/lib/collection-query";
import { formatNumber } from "@/lib/format";
import { getFacets, listCategories, listProducts } from "@/lib/woo/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const ALL = { slug: "all", name: "همه محصولات", description: "مجموعه کامل کت‌وشلوار، پوشاک رسمی و اکسسوری شوما", parent: 0 };

async function resolve(slug: string) {
  if (slug === "all") return { cat: ALL, parent: null };
  const cats = await listCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return null;
  return { cat, parent: cat.parent ? cats.find((c) => c.id === cat.parent) ?? null : null };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await resolve(slug).catch(() => null);
  if (!found) return { title: "دسته‌بندی پیدا نشد", robots: { index: false } };
  const filtered = Object.keys(sp).some((k) => ["min", "max", "size", "color", "onsale", "instock", "sort", "page"].includes(k));
  return {
    title: found.cat.name,
    description: found.cat.description || SITE.description,
    alternates: { canonical: `/collections/${slug}` },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: `${found.cat.name} | ${SITE.name}`, description: found.cat.description || SITE.description, url: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await resolve(slug);
  if (!found) notFound();
  const { params: q, page } = parseCollectionQuery(sp, slug);
  const [{ products, total, totalPages }, facets] = await Promise.all([listProducts(q), getFacets(slug === "all" ? undefined : slug)]);
  if (page > 1 && products.length === 0) notFound();

  const crumbs = [{ label: "خانه", href: "/" }, ...(found.parent ? [{ label: found.parent.name, href: `/collections/${found.parent.slug}` }] : []), { label: found.cat.name }];
  const href = (p: number) => {
    const n = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    n.set("page", String(p));
    return `/collections/${slug}?${n}`;
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${SITE.url}${c.href ?? `/collections/${slug}`}` })) }} />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8 mt-5 max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{found.cat.name}</h1>
        <p className="mt-2 text-ink-600">{found.cat.description}</p>
      </header>
      <div className="flex items-center justify-between gap-4 border-y border-line py-3">
        <div className="flex items-center gap-4">
          <MobileFilters facets={facets} total={total} />
          <p className="text-sm text-ink-600" data-testid="result-count">{formatNumber(total)} محصول</p>
        </div>
        <SortSelect />
      </div>
      <div className="mt-8 flex gap-10">
        <FilterSidebar facets={facets} />
        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <EmptyState title="محصولی با این فیلترها پیدا نشد" body="فیلترها را کم کنید یا همه محصولات را ببینید." action={<Button href={`/collections/${slug}`} variant="secondary">حذف فیلترها</Button>} />
          ) : (
            <ProductGrid products={products} priorityCount={4} />
          )}
          <Pagination page={page} totalPages={totalPages} hrefFor={href} />
        </div>
      </div>
    </div>
  );
}
