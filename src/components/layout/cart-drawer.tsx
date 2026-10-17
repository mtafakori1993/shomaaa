"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cart";
import { formatToman } from "@/lib/format";
import { CartLine } from "@/components/shop/cart-line";
import { SITE } from "@/lib/config";

export function CartButton() {
  const count = useCart((s) => s.cart?.itemsCount ?? 0);
  const setOpen = useCart((s) => s.setOpen);
  return (
    <button type="button" onClick={() => setOpen(true)} aria-label={`سبد خرید، ${count.toLocaleString("fa-IR")} کالا`} className="relative grid size-11 place-items-center rounded-sm hover:bg-ivory-200">
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 && (
        <span className="absolute left-1 top-1 grid min-w-5 place-items-center rounded-full bg-bronze-600 px-1 text-[0.7rem] font-bold leading-5 text-ivory-50" data-testid="cart-count">
          {count.toLocaleString("fa-IR")}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { cart, open, setOpen, loaded, error } = useCart();
  const items = cart?.items ?? [];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="سبد خرید" side="end" description="کالاهای انتخاب‌شده شما">
        <div className="flex-1 overflow-y-auto px-5" data-testid="cart-drawer">
          {!loaded ? (
            <p className="py-10 text-center text-ink-600">در حال بارگذاری…</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="size-10 text-ink-500" aria-hidden />
              <p className="font-medium">سبد خرید شما خالی است</p>
              <Button href="/collections/all" onClick={() => setOpen(false)}>مشاهده محصولات</Button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.key}><CartLine item={i} compact /></li>
              ))}
            </ul>
          )}
          {error && <p role="alert" className="py-2 text-sm text-danger-600">{error}</p>}
        </div>
        {items.length > 0 && cart && (
          <div className="space-y-3 border-t border-line bg-ivory-100 p-5">
            <div className="flex items-center justify-between">
              <span className="text-ink-700">جمع کالاها</span>
              <span className="font-bold">{formatToman(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-ink-600">
              {cart.subtotal >= SITE.freeShippingThreshold ? "ارسال این سفارش رایگان است." : `با خرید بالای ${formatToman(SITE.freeShippingThreshold)} ارسال رایگان است؛ هزینه ارسال در مرحله بعد محاسبه می‌شود.`}
            </p>
            <div className="grid gap-2">
              <Button href="/checkout" size="lg" onClick={() => setOpen(false)}>ادامه و تسویه حساب</Button>
              <Link href="/cart" onClick={() => setOpen(false)} className="py-2 text-center text-sm underline underline-offset-4">مشاهده سبد خرید</Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
