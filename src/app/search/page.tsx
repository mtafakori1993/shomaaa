import type { Metadata } from "next";
import { ProductGrid } from "@/components/shop/product-card";
import { Pagination } from "@/components/shop/pagination";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { listProducts } from "@/lib/woo/catalog";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "نتایج جست‌وجو", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 60) ?? "";
  const page = Math.max(1, Math.min(200, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1));
  const result = q.length >= 2 ? await listProducts({ search: q, page, perPage: 12 }) : null;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "جست‌وجو" }]} />
      <h1 className="mb-8 mt-5 text-3xl font-bold">{q ? <>نتایج جست‌وجو برای «{q}»</> : "جست‌وجو"}</h1>
      {!result ? (
        <EmptyState title="عبارت جست‌وجو را وارد کنید" body="حداقل دو حرف بنویسید؛ مثلاً «کت‌وشلوار» یا «کراوات»." />
      ) : result.products.length === 0 ? (
        <EmptyState title={`برای «${q}» محصولی پیدا نشد`} body="املای عبارت را بررسی کنید یا دسته‌بندی‌ها را مرور کنید." action={<Button href="/collections/all" variant="secondary">مشاهده همه محصولات</Button>} />
      ) : (
        <>
          <p className="mb-6 text-sm text-ink-600" data-testid="result-count">{formatNumber(result.total)} محصول پیدا شد</p>
          <ProductGrid products={result.products} />
          <Pagination page={page} totalPages={result.totalPages} hrefFor={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`} />
        </>
      )}
    </div>
  );
}
