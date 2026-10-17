"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { CouponBox, Totals } from "@/components/shop/order-summary";
import { checkoutSchema, type CheckoutInput } from "@/lib/checkout-schema";
import { IR_STATE_OPTIONS } from "@/lib/iran";
import { SITE } from "@/lib/config";
import { useCart } from "@/stores/cart";

const empty: CheckoutInput = { firstName: "", lastName: "", email: "", phone: "", state: "", city: "", address: "", postcode: "", note: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loaded } = useCart();
  const [v, setV] = useState<CheckoutInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutInput, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof CheckoutInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const parsed = checkoutSchema.safeParse(v);
    if (!parsed.success) {
      const next: typeof errors = {};
      parsed.error.issues.forEach((i) => { const k = i.path[0] as keyof CheckoutInput; next[k] ??= i.message; });
      setErrors(next);
      const first = Object.keys(next)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ثبت سفارش انجام نشد");
      await useCart.getState().refresh();
      router.push(`/order/${json.orderId}?key=${encodeURIComponent(json.orderKey)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "ثبت سفارش انجام نشد؛ دوباره تلاش کنید");
      setBusy(false);
    }
  }

  const items = cart?.items ?? [];
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "سبد خرید", href: "/cart" }, { label: "تسویه حساب" }]} />
      <h1 className="mb-8 mt-5 text-3xl font-bold">تسویه حساب</h1>
      {!loaded ? <div aria-busy className="skeleton h-64" /> : items.length === 0 ? (
        <EmptyState title="سبد خرید شما خالی است" body="برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید." action={<Button href="/collections/all">مشاهده محصولات</Button>} />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <form onSubmit={submit} noValidate className="space-y-8" aria-label="اطلاعات ارسال">
            {SITE.demoMode && (
              <div role="note" className="flex gap-3 rounded-sm border border-bronze-300 bg-bronze-100 p-4 text-sm leading-7 text-bronze-700">
                <Info className="mt-1 size-5 shrink-0" aria-hidden />
                <p><strong>فروشگاه در حالت نمایشی است.</strong> سفارش شما در سیستم ثبت می‌شود، اما درگاه پرداخت واقعی متصل نیست و هیچ مبلغی برداشت نمی‌شود.</p>
              </div>
            )}
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-lg font-bold">مشخصات گیرنده</legend>
              <Field label="نام" required error={errors.firstName}>{(f) => <Input id={f.id} name="firstName" value={v.firstName} onChange={set("firstName")} autoComplete="given-name" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
              <Field label="نام خانوادگی" required error={errors.lastName}>{(f) => <Input id={f.id} name="lastName" value={v.lastName} onChange={set("lastName")} autoComplete="family-name" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
              <Field label="شماره موبایل" required error={errors.phone} hint="مثال: ۰۹۱۲۱۲۳۴۵۶۷">{(f) => <Input id={f.id} name="phone" type="tel" inputMode="tel" dir="ltr" className="text-right" value={v.phone} onChange={set("phone")} autoComplete="tel" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
              <Field label="ایمیل" required error={errors.email} hint="رسید سفارش به این نشانی ارسال می‌شود">{(f) => <Input id={f.id} name="email" type="email" inputMode="email" dir="ltr" className="text-right" value={v.email} onChange={set("email")} autoComplete="email" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-lg font-bold">نشانی تحویل</legend>
              <Field label="استان" required error={errors.state}>{(f) => (
                <Select id={f.id} name="state" value={v.state} onChange={set("state")} invalid={f.invalid} aria-describedby={f.describedBy} autoComplete="address-level1">
                  <option value="">انتخاب کنید</option>
                  {IR_STATE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              )}</Field>
              <Field label="شهر" required error={errors.city}>{(f) => <Input id={f.id} name="city" value={v.city} onChange={set("city")} autoComplete="address-level2" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
              <Field className="sm:col-span-2" label="نشانی کامل" required error={errors.address}>{(f) => <Textarea id={f.id} name="address" value={v.address} onChange={set("address")} autoComplete="street-address" invalid={f.invalid} aria-describedby={f.describedBy} className="min-h-24" />}</Field>
              <Field label="کدپستی" required error={errors.postcode} hint="۱۰ رقم، بدون خط تیره">{(f) => <Input id={f.id} name="postcode" inputMode="numeric" dir="ltr" className="text-right" value={v.postcode} onChange={set("postcode")} autoComplete="postal-code" invalid={f.invalid} aria-describedby={f.describedBy} />}</Field>
              <Field className="sm:col-span-2" label="توضیحات سفارش (اختیاری)" error={errors.note}>{(f) => <Textarea id={f.id} name="note" value={v.note} onChange={set("note")} invalid={f.invalid} aria-describedby={f.describedBy} className="min-h-20" />}</Field>
            </fieldset>
            {submitError && <p role="alert" className="rounded-sm bg-danger-100 p-3 text-sm text-danger-600" data-testid="submit-error">{submitError}</p>}
            <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-64" loading={busy} data-testid="place-order">{SITE.demoMode ? "ثبت سفارش آزمایشی" : "ثبت سفارش و پرداخت"}</Button>
          </form>
          <aside aria-label="خلاصه سفارش" className="h-fit space-y-6 rounded-sm border border-line bg-ivory-50 p-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold">خلاصه سفارش</h2>
            <Totals showItems />
            <CouponBox />
          </aside>
        </div>
      )}
    </div>
  );
}
