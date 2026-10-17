import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatToman, discountPercent } from "@/lib/format";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "danger" | "olive"; className?: string }) {
  const tones = {
    neutral: "bg-ivory-200 text-ink-800",
    accent: "bg-bronze-100 text-bronze-700",
    danger: "bg-danger-100 text-danger-600",
    olive: "bg-olive-100 text-olive-700",
  };
  return <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="text-sm text-ink-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? <Link href={it.href} className="hover:text-ink-900 hover:underline">{it.label}</Link> : <span aria-current="page" className="text-ink-900">{it.label}</span>}
            {i < items.length - 1 && <ChevronLeft className="size-3.5" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Price({ price, regular, max, size = "md", className }: { price: number; regular?: number | null; max?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const onSale = regular && regular > price;
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" };
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", sizes[size], className)}>
      {onSale && (
        <>
          <span className="sr-only">قیمت قبل از تخفیف</span>
          <del className="text-[0.85em] text-ink-600">{formatToman(regular)}</del>
        </>
      )}
      <span className="font-bold text-ink-900">
        {onSale && <span className="sr-only">قیمت با تخفیف </span>}
        {max && max > price ? "از " : ""}
        {formatToman(price)}
      </span>
      {onSale && <Badge tone="danger">{discountPercent(regular, price).toLocaleString("fa-IR")}٪ تخفیف</Badge>}
    </p>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      {body && <p className="text-ink-600">{body}</p>}
      {action}
    </div>
  );
}
