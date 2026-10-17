"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { CartLine } from "@/components/shop/cart-line";
import { CouponBox, Totals } from "@/components/shop/order-summary";
import { useCart } from "@/stores/cart";

export default function CartPage() {
  const { cart, loaded, error } = useCart();
  const items = cart?.items ?? [];
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "سبد خرید" }]} />
      <h1 className="mb-8 mt-5 text-3xl font-bold">سبد خرید</h1>
      {!loaded ? (
        <div aria-busy className="space-y-4"><div className="skeleton h-28" /><div className="skeleton h-28" /></div>
      ) : items.length === 0 ? (
        <EmptyState title="سبد خرید شما خالی است" body="محصولات مورد علاقه‌تان را به سبد اضافه کنید." action={<Button href="/collections/all"><ShoppingBag className="size-4" aria-hidden />مشاهده محصولات</Button>} />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y divide-line border-y border-line" data-testid="cart-items">
            {items.map((i) => <li key={i.key}><CartLine item={i} /></li>)}
          </ul>
          <aside aria-label="خلاصه سفارش" className="h-fit space-y-6 rounded-sm border border-line bg-ivory-50 p-5 lg:sticky lg:top-28">
            <CouponBox />
            <Totals />
            {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
            <Button href="/checkout" size="lg" className="w-full">ادامه و تسویه حساب</Button>
          </aside>
        </div>
      )}
    </div>
  );
}
