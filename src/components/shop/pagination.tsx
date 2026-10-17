import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const item = "grid size-11 place-items-center rounded-sm text-sm";
  return (
    <nav aria-label="صفحه‌بندی" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-1">
        {page > 1 && <li><Link href={hrefFor(page - 1)} rel="prev" aria-label="صفحه قبل" className={cn(item, "hover:bg-ivory-200")}><ChevronRight className="size-4" aria-hidden /></Link></li>}
        {pages.map((p) => (
          <li key={p}>
            <Link href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={cn(item, p === page ? "bg-ink-900 text-ivory-50" : "hover:bg-ivory-200")}>{toFaDigits(p)}</Link>
          </li>
        ))}
        {page < totalPages && <li><Link href={hrefFor(page + 1)} rel="next" aria-label="صفحه بعد" className={cn(item, "hover:bg-ivory-200")}><ChevronLeft className="size-4" aria-hidden /></Link></li>}
      </ul>
    </nav>
  );
}
