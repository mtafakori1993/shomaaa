"use client";

import Image from "next/image";
import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useCart } from "@/stores/cart";
import { formatToman, toFaDigits } from "@/lib/format";
import { SITE } from "@/lib/config";

export function CouponBox() {
  const { cart, applyCoupon, removeCoupon, busy } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = await applyCoupon(code.trim());
    setMsg(ok ? { ok: true, text: "کد تخفیف اعمال شد" } : { ok: false, text: useCart.getState().error ?? "کد تخفیف معتبر نیست" });
    if (ok) setCode("");
  }
  return (
    <div>
      <form onSubmit={submit} className="flex gap-2" noValidate>
        <label htmlFor="coupon" className="sr-only">کد تخفیف</label>
        <Input id="coupon" dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تخفیف" className="h-11" autoComplete="off" />
        <Button type="submit" variant="secondary" loading={busy}>اعمال</Button>
      </form>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-success-600" : "text-danger-600"}`}>{msg.text}</p>}
      {cart?.coupons.map((c) => (
        <p key={c.code} className="mt-2 flex items-center gap-2 text-sm">
          <Tag className="size-4 text-bronze-600" aria-hidden /><span className="ltr font-medium">{c.code}</span>
          <button type="button" onClick={() => removeCoupon(c.code)} aria-label={`حذف کد ${c.code}`} className="mr-auto grid size-8 place-items-center rounded-sm hover:bg-ivory-200"><X className="size-4" aria-hidden /></button>
        </p>
      ))}
    </div>
  );
}

export function Totals({ showItems }: { showItems?: boolean }) {
  const { cart, selectShipping, busy } = useCart();
  if (!cart) return null;
  const rates = cart.shippingRates;
  return (
    <div className="space-y-4">
      {showItems && (
        <ul className="divide-y divide-line">
          {cart.items.map((i) => (
            <li key={i.key} className="flex items-center gap-3 py-3">
              <span className="relative block aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-xs bg-ivory-200">
                {i.image && <Image src={i.image.src} alt="" fill sizes="56px" className="object-cover" />}
                <span className="absolute left-0 top-0 grid min-w-5 place-items-center bg-ink-900 px-1 text-[0.7rem] text-ivory-50">{toFaDigits(i.quantity)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{i.name}</span>
                {i.variation.length > 0 && <span className="text-xs text-ink-600">{i.variation.map((v) => v.value).join(" · ")}</span>}
              </span>
              <span className="text-sm">{formatToman(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink-600">جمع کالاها</dt><dd data-testid="subtotal">{formatToman(cart.subtotal)}</dd></div>
        {cart.discount > 0 && <div className="flex justify-between text-success-600"><dt>تخفیف</dt><dd>− {formatToman(cart.discount)}</dd></div>}
        {cart.needsShipping && (
          <div>
            <dt className="mb-2 text-ink-600">روش ارسال</dt>
            <dd>
              {rates.length === 0 ? <span className="text-ink-600">پس از ورود نشانی محاسبه می‌شود</span> : (
                <ul className="space-y-1">
                  {rates.map((r) => (
                    <li key={r.rateId}>
                      <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-sm border border-line px-3 has-[:checked]:border-ink-900">
                        <input type="radio" name="shipping" className="accent-ink-900" checked={r.selected} disabled={busy} onChange={() => cart.packageId !== null && selectShipping(cart.packageId, r.rateId)} />
                        <span className="flex-1">{r.name}</span>
                        <span>{r.cost === 0 ? "رایگان" : formatToman(r.cost)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-4 text-base font-bold"><dt>مبلغ قابل پرداخت</dt><dd data-testid="total">{formatToman(cart.total)}</dd></div>
      </dl>
      {cart.subtotal < SITE.freeShippingThreshold && (
        <p className="text-xs text-ink-600">با {formatToman(SITE.freeShippingThreshold - cart.subtotal)} خرید بیشتر، ارسال رایگان می‌شود.</p>
      )}
    </div>
  );
}
