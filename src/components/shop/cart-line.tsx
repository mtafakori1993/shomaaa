"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/stores/cart";
import { formatToman, toFaDigits } from "@/lib/format";
import type { CartItem } from "@/lib/woo/types";
import { cn } from "@/lib/cn";

export function QuantityStepper({ value, max, onChange, disabled, label }: { value: number; max: number; onChange: (n: number) => void; disabled?: boolean; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-10 items-center rounded-sm border border-ink-500/50 bg-ivory-50">
      <button type="button" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="کاهش تعداد" className="grid size-10 place-items-center rounded-sm hover:bg-ivory-200 disabled:opacity-40">
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" className="w-8 text-center text-sm font-medium tabular-nums">{toFaDigits(value)}</output>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="افزایش تعداد" className="grid size-10 place-items-center rounded-sm hover:bg-ivory-200 disabled:opacity-40">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function CartLine({ item, compact }: { item: CartItem; compact?: boolean }) {
  const { update, remove, busy, setOpen } = useCart();
  const sale = item.regularUnitPrice > item.unitPrice;
  return (
    <div className={cn("flex gap-4 py-5", compact ? "" : "sm:gap-6")} data-testid="cart-line">
      <Link href={`/products/${item.slug}`} onClick={() => setOpen(false)} className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xs bg-ivory-200 sm:w-24">
        {item.image && <Image src={item.image.src} alt={item.image.alt || item.name} fill sizes="96px" className="object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${item.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 font-medium hover:underline">{item.name}</Link>
            {item.variation.length > 0 && (
              <p className="mt-0.5 text-xs text-ink-600">{item.variation.map((v) => `${v.attribute}: ${v.value}`).join(" · ")}</p>
            )}
          </div>
          <button type="button" onClick={() => remove(item.key)} disabled={busy} aria-label={`حذف ${item.name} از سبد`} className="grid size-9 shrink-0 place-items-center rounded-sm text-ink-600 hover:bg-ivory-200 hover:text-danger-600">
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper value={item.quantity} max={item.maxQuantity} disabled={busy} onChange={(n) => update(item.key, n)} label={`تعداد ${item.name}`} />
          <p className="text-end">
            {sale && <del className="block text-xs text-ink-500">{formatToman(item.regularUnitPrice * item.quantity)}</del>}
            <span className="font-bold" data-testid="line-total">{formatToman(item.lineTotal)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
