"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Slider, Accordion } from "radix-ui";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { colorHex } from "@/lib/colors";
import { formatNumber, formatToman } from "@/lib/format";
import type { Facets } from "@/lib/woo/catalog";
import { cn } from "@/lib/cn";

export const SORTS = [
  { value: "date", label: "تازه‌ترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "title", label: "بر اساس نام" },
] as const;

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    p.delete("page");
    start(() => router.push(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  };
  return { sp, update, pending };
}

export function SortSelect() {
  const { sp, update } = useQueryUpdater();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-ink-600">مرتب‌سازی</label>
      <Select id="sort" className="h-10 w-40 text-sm" value={sp.get("sort") ?? "date"} onChange={(e) => update((p) => p.set("sort", e.target.value))}>
        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
    </div>
  );
}

function toggle(p: URLSearchParams, key: string, val: string, on: boolean) {
  const cur = (p.get(key) ?? "").split(",").filter(Boolean);
  const next = on ? [...new Set([...cur, val])] : cur.filter((v) => v !== val);
  if (next.length) p.set(key, next.join(",")); else p.delete(key);
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={id} className="border-b border-line">
      <Accordion.Header>
        <Accordion.Trigger className="group flex h-12 w-full items-center justify-between text-start font-medium">
          {title}
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="pb-5">{children}</Accordion.Content>
    </Accordion.Item>
  );
}

function Panel({ facets }: { facets: Facets }) {
  const { sp, update, pending } = useQueryUpdater();
  const sizes = (sp.get("size") ?? "").split(",").filter(Boolean);
  const colors = (sp.get("color") ?? "").split(",").filter(Boolean);
  const range = facets.price;
  const lo = Number(sp.get("min") ?? range?.min ?? 0);
  const hi = Number(sp.get("max") ?? range?.max ?? 0);
  const [val, setVal] = useState<[number, number]>([lo, hi]);
  const step = 100_000;

  return (
    <div aria-busy={pending} className={cn(pending && "opacity-70")}>
      <Accordion.Root type="multiple" defaultValue={["avail", "price", "size", "color"]}>
        <Section id="avail" title="موجودی و تخفیف">
          <div className="space-y-1">
            {[["instock", "فقط کالاهای موجود"], ["onsale", "فقط کالاهای تخفیف‌دار"]].map(([k, label]) => (
              <label key={k} className="flex min-h-10 cursor-pointer items-center gap-3">
                <input type="checkbox" className="size-4 accent-ink-900" checked={sp.get(k) === "1"} onChange={(e) => update((p) => (e.target.checked ? p.set(k, "1") : p.delete(k)))} />
                {label}
              </label>
            ))}
          </div>
        </Section>
        {range && range.max > range.min && (
          <Section id="price" title="محدوده قیمت">
            <Slider.Root
              dir="rtl" min={Math.floor(range.min / step) * step} max={Math.ceil(range.max / step) * step} step={step} value={val} minStepsBetweenThumbs={1}
              onValueChange={(v) => setVal([v[0], v[1]])}
              onValueCommit={(v) => update((p) => { p.set("min", String(v[0])); p.set("max", String(v[1])); })}
              className="relative flex h-6 w-full touch-none select-none items-center" aria-label="محدوده قیمت"
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-ivory-300"><Slider.Range className="absolute h-full rounded-full bg-ink-900" /></Slider.Track>
              {[0, 1].map((i) => <Slider.Thumb key={i} aria-label={i === 0 ? "حداقل قیمت" : "حداکثر قیمت"} className="block size-5 rounded-full border-2 border-ink-900 bg-ivory-50 shadow-raised" />)}
            </Slider.Root>
            <p className="mt-3 flex justify-between text-sm text-ink-700"><span>{formatToman(val[0])}</span><span>{formatToman(val[1])}</span></p>
          </Section>
        )}
        {facets.sizes.length > 0 && (
          <Section id="size" title="سایز">
            <div className="flex flex-wrap gap-2">
              {facets.sizes.map((s) => (
                <label key={s.slug} className={cn("grid h-10 min-w-12 cursor-pointer place-items-center rounded-sm border px-3 text-sm has-[:checked]:border-ink-900 has-[:checked]:bg-ink-900 has-[:checked]:text-ivory-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2", "border-ink-500/50")}>
                  <input type="checkbox" className="sr-only" checked={sizes.includes(s.slug)} onChange={(e) => update((p) => toggle(p, "size", s.slug, e.target.checked))} />
                  {s.name}
                </label>
              ))}
            </div>
          </Section>
        )}
        {facets.colors.length > 0 && (
          <Section id="color" title="رنگ">
            <div className="flex flex-wrap gap-3">
              {facets.colors.map((c) => (
                <label key={c.slug} title={c.name} className="relative grid size-9 cursor-pointer place-items-center rounded-full border border-ink-900/25 has-[:checked]:ring-2 has-[:checked]:ring-ink-900 has-[:checked]:ring-offset-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2" style={{ background: colorHex(c.slug) }}>
                  <input type="checkbox" className="sr-only" checked={colors.includes(c.slug)} onChange={(e) => update((p) => toggle(p, "color", c.slug, e.target.checked))} />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </Section>
        )}
      </Accordion.Root>
      {(sp.has("min") || sp.has("size") || sp.has("color") || sp.has("onsale") || sp.has("instock")) && (
        <Button variant="quiet" className="mt-3 w-full" onClick={() => update((p) => ["min", "max", "size", "color", "onsale", "instock"].forEach((k) => p.delete(k)))}>پاک کردن فیلترها</Button>
      )}
    </div>
  );
}

export function FilterSidebar({ facets }: { facets: Facets }) {
  return <aside aria-label="فیلتر محصولات" className="hidden w-64 shrink-0 lg:block"><Panel facets={facets} /></aside>;
}

export function MobileFilters({ facets, total }: { facets: Facets; total: number }) {
  return (
    <div className="lg:hidden">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm"><SlidersHorizontal className="size-4" aria-hidden />فیلترها</Button>
        </DialogTrigger>
        <DialogContent title="فیلتر محصولات" side="start" description="محدود کردن فهرست محصولات">
          <div className="flex-1 overflow-y-auto px-5"><Panel facets={facets} /></div>
          <div className="border-t border-line p-4"><DialogClose asChild><Button className="w-full" size="lg">نمایش {formatNumber(total)} محصول</Button></DialogClose></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
