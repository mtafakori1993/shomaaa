import Image from "next/image";
import Link from "next/link";
import { Badge, Price } from "@/components/ui/misc";
import { colorHex } from "@/lib/colors";
import type { ProductSummary } from "@/lib/woo/types";
import { cn } from "@/lib/cn";

export function ProductCard({ product, priority, sizes = "(min-width:1280px) 22vw, (min-width:768px) 31vw, 48vw" }: { product: ProductSummary; priority?: boolean; sizes?: string }) {
  const p = product;
  const onSale = p.salePrice !== null && p.regularPrice > p.price;
  return (
    <article className="group relative flex flex-col" data-testid="product-card">
      <Link href={`/products/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-xs bg-ivory-200">
        {p.image ? (
          <Image
            src={p.image.src} alt={p.image.alt || p.name} fill sizes={sizes} priority={priority} quality={75}
            className={cn("object-cover transition-opacity duration-300", p.hoverImage && "group-hover:opacity-0", !p.inStock && "opacity-60")}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-ink-500">بدون تصویر</span>
        )}
        {p.hoverImage && (
          <Image src={p.hoverImage.src} alt="" fill sizes={sizes} quality={75} className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
        <span className="absolute right-2 top-2 flex flex-col items-start gap-1">
          {onSale && <Badge tone="danger">تخفیف</Badge>}
          {!p.inStock && <Badge>ناموجود</Badge>}
        </span>
        <span className="sr-only">{p.name}</span>
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-[0.95rem] font-medium leading-7">
          <Link href={`/products/${p.slug}`} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4" aria-label={p.name}>{p.name}</Link>
        </h3>
        <Price price={p.price} regular={onSale ? p.regularPrice : null} max={p.priceMax} size="sm" />
        {p.colors.length > 1 && (
          <ul className="mt-1 flex gap-1.5" aria-label="رنگ‌های موجود">
            {p.colors.map((c) => (
              <li key={c.id} title={c.name} className="size-4 rounded-full border border-ink-900/20" style={{ background: colorHex(c.slug) }}>
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductSummary[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4" data-testid="product-grid">
      {products.map((p, i) => (
        <li key={p.id}><ProductCard product={p} priority={i < priorityCount} /></li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4" aria-busy aria-label="در حال بارگذاری محصولات">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="skeleton aspect-[4/5]" />
          <div className="skeleton mt-3 h-5 w-3/4" />
          <div className="skeleton mt-2 h-4 w-1/2" />
        </li>
      ))}
    </ul>
  );
}
