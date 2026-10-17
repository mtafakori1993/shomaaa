"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Check, Minus, Plus, Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Price } from "@/components/ui/misc";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { colorHex } from "@/lib/colors";
import { toFaDigits } from "@/lib/format";
import type { ProductDetail, ProductImage } from "@/lib/woo/types";
import { cn } from "@/lib/cn";

export function ProductView({ product }: { product: ProductDetail }) {
  const p = product;
  const varAttrs = p.attributes.filter((a) => a.hasVariations);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);

  // Attribute combos that actually exist and are purchasable, used to disable impossible choices.
  const available = (tax: string, slug: string) =>
    p.variations.some((v) => v.inStock && v.attributes[tax] === slug && Object.entries(selected).every(([t, s]) => t === tax || v.attributes[t] === s));

  const variation = useMemo(() => {
    if (!varAttrs.length) return null;
    if (!varAttrs.every((a) => selected[a.taxonomy])) return null;
    return p.variations.find((v) => varAttrs.every((a) => v.attributes[a.taxonomy] === selected[a.taxonomy])) ?? null;
  }, [p.variations, selected, varAttrs]);

  // Gallery: a variation image (e.g. colour) takes precedence over the product gallery.
  const gallery: ProductImage[] = useMemo(() => {
    const extra = p.variations.map((v) => v.image).filter((i): i is ProductImage => !!i);
    const all = [...p.images];
    extra.forEach((i) => { if (!all.some((g) => g.id === i.id)) all.push(i); });
    return all;
  }, [p.images, p.variations]);
  const shown = variation?.image ? Math.max(0, gallery.findIndex((g) => g.id === variation.image!.id)) : activeImage;
  const current = gallery[shown] ?? gallery[0];

  const price = variation?.price ?? p.price;
  const regular = variation ? (variation.salePrice !== null ? variation.regularPrice : null) : p.salePrice !== null ? p.regularPrice : null;
  const inStock = variation ? variation.inStock : p.inStock;
  const maxQty = 10;

  async function submit() {
    const missing: Record<string, string> = {};
    varAttrs.forEach((a) => { if (!selected[a.taxonomy]) missing[a.taxonomy] = `لطفاً ${a.name} را انتخاب کنید`; });
    if (Object.keys(missing).length) {
      setErrors(missing);
      const firstTax = varAttrs.find((a) => missing[a.taxonomy])!.taxonomy;
      groupRefs.current[firstTax]?.focus();
      return;
    }
    const id = variation ? variation.id : p.id;
    if (varAttrs.length && !variation) { setErrors({ _: "این ترکیب در حال حاضر موجود نیست" }); return; }
    setErrors({});
    setAdding(true);
    const ok = await add(id, qty);
    setAdding(false);
    if (ok) push("به سبد خرید اضافه شد", "success");
    else push(useCart.getState().error ?? "افزودن به سبد انجام نشد", "error");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row-reverse" data-testid="gallery">
        {gallery.length > 1 && (
          <ul className="flex gap-2 sm:w-20 sm:flex-col" aria-label="تصاویر محصول">
            {gallery.map((g, i) => (
              <li key={g.id} className="w-16 sm:w-full">
                <button type="button" onClick={() => setActiveImage(i)} aria-label={`نمایش تصویر ${toFaDigits(i + 1)}`} aria-current={i === shown} className={cn("relative block aspect-[4/5] w-full overflow-hidden rounded-xs border-2 bg-ivory-200", i === shown ? "border-ink-900" : "border-transparent hover:border-ink-500/50")}>
                  <Image src={g.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xs bg-ivory-200">
          {current ? <Image key={current.id} src={current.src} alt={current.alt || p.name} fill priority sizes="(min-width:1024px) 52vw, 100vw" quality={82} className="object-cover" /> : <span className="absolute inset-0 grid place-items-center text-ink-500">بدون تصویر</span>}
          <Badge className="absolute bottom-3 right-3 bg-ivory-50/90">تصویر نمونه (تصویرسازی‌شده)</Badge>
        </div>
      </div>

      {/* Purchase panel */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-600">
          <span>کد محصول:</span><span className="ltr">{variation?.id ? p.sku : p.sku}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-10 sm:text-3xl" data-testid="product-title">{p.name}</h1>
        <div className="mt-4" data-testid="product-price" aria-live="polite">
          <Price price={price} regular={regular} max={variation ? null : p.priceMax} size="lg" />
        </div>
        <p className="mt-4 leading-8 text-ink-700">{p.shortDescription}</p>

        <div className="mt-6 space-y-6">
          {varAttrs.map((a) => {
            const isColor = a.taxonomy === "pa_color";
            const err = errors[a.taxonomy];
            const chosen = a.terms.find((t) => t.slug === selected[a.taxonomy]);
            return (
              <div key={a.taxonomy}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span id={`lbl-${a.taxonomy}`} className="font-medium">{a.name}{chosen && <span className="mr-2 font-normal text-ink-600">{chosen.name}</span>}</span>
                  {a.taxonomy === "pa_size" && <span className="flex items-center gap-1 text-xs text-ink-600"><Ruler className="size-3.5" aria-hidden />راهنمای سایز در توضیحات</span>}
                </div>
                <div
                  ref={(el) => { groupRefs.current[a.taxonomy] = el; }} tabIndex={-1} role="radiogroup" aria-labelledby={`lbl-${a.taxonomy}`} aria-invalid={!!err || undefined} aria-describedby={err ? `err-${a.taxonomy}` : undefined}
                  className="flex flex-wrap gap-2 rounded-xs outline-offset-4"
                >
                  {a.terms.map((t) => {
                    const ok = available(a.taxonomy, t.slug);
                    const on = selected[a.taxonomy] === t.slug;
                    return (
                      <button
                        key={t.slug} type="button" role="radio" aria-checked={on} disabled={!ok} title={!ok ? "ناموجود" : t.name}
                        onClick={() => { setSelected((s) => ({ ...s, [a.taxonomy]: on ? "" : t.slug })); setErrors({}); }}
                        className={cn(
                          isColor ? "relative size-10 rounded-full border border-ink-900/25" : "relative grid h-11 min-w-12 place-items-center rounded-sm border px-3 text-sm font-medium",
                          on ? (isColor ? "ring-2 ring-ink-900 ring-offset-2" : "border-ink-900 bg-ink-900 text-ivory-50") : "border-ink-500/50 hover:border-ink-900",
                          !ok && "cursor-not-allowed opacity-40 " + (isColor ? "" : "line-through"),
                        )}
                        style={isColor ? { background: colorHex(t.slug) } : undefined}
                      >
                        {isColor ? <><span className="sr-only">{t.name}{!ok ? " (ناموجود)" : ""}</span>{on && <Check className={cn("mx-auto size-4", ["white", "ivory", "cream", "champagne", "beige", "blue"].some((c) => t.slug.includes(c)) ? "text-ink-900" : "text-ivory-50")} aria-hidden />}</> : <>{t.name}{!ok && <span className="sr-only"> (ناموجود)</span>}</>}
                      </button>
                    );
                  })}
                </div>
                {err && <p id={`err-${a.taxonomy}`} role="alert" className="mt-2 text-sm text-danger-600" data-testid="variation-error">{err}</p>}
              </div>
            );
          })}
          {errors._ && <p role="alert" className="text-sm text-danger-600">{errors._}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="تعداد" className="inline-flex h-14 items-center rounded-sm border border-ink-500/50 bg-ivory-50">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="کاهش تعداد" className="grid size-12 place-items-center hover:bg-ivory-200 disabled:opacity-40"><Minus className="size-4" aria-hidden /></button>
              <output className="w-8 text-center font-medium" aria-live="polite">{toFaDigits(qty)}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="افزایش تعداد" className="grid size-12 place-items-center hover:bg-ivory-200 disabled:opacity-40"><Plus className="size-4" aria-hidden /></button>
            </div>
            <Button size="lg" className="min-w-0 flex-1" onClick={submit} loading={adding} disabled={!inStock} data-testid="add-to-cart">
              <ShoppingBag className="size-5" aria-hidden />{inStock ? "افزودن به سبد خرید" : "ناموجود"}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-sm" aria-live="polite">
            <span className={cn("size-2 rounded-full", inStock ? "bg-success-600" : "bg-danger-600")} aria-hidden />
            {inStock ? (variation?.lowStock ? `تنها ${toFaDigits(variation.lowStock)} عدد باقی مانده` : p.lowStock ? `تنها ${toFaDigits(p.lowStock)} عدد باقی مانده` : "موجود") : "این محصول در حال حاضر ناموجود است"}
          </p>
        </div>
      </div>
    </div>
  );
}
