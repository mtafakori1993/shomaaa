import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeFetch, WooError } from "@/lib/woo/client";
import { formatToman, toFaDigits } from "@/lib/format";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "وضعیت سفارش", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

interface Order {
  id: number; status: string; order_key?: string;
  items: { key: string; name: string; quantity: number; totals: { line_total: string } }[];
  totals: { total_price: string; total_shipping: string; total_items: string };
  billing_address: { first_name: string; last_name: string; city: string; address_1: string };
}

const STATUS: Record<string, string> = { processing: "در حال پردازش", pending: "در انتظار پرداخت", "on-hold": "در انتظار بررسی", completed: "تکمیل‌شده", cancelled: "لغوشده", failed: "ناموفق" };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const key = Array.isArray(sp.key) ? sp.key[0] : sp.key;
  if (!/^\d+$/.test(id) || !key || !/^wc_order_\w+$/.test(key)) notFound();

  const raw = (await cookies()).get("shm_last_order")?.value;
  let email: string | undefined;
  try { const c = raw ? JSON.parse(raw) : null; if (c?.id === Number(id)) email = c.email; } catch { /* ignore */ }

  let order: Order | null = null;
  if (email) {
    try {
      order = (await storeFetch<Order>(`/order/${id}?key=${encodeURIComponent(key)}&billing_email=${encodeURIComponent(email)}`)).data;
    } catch (e) {
      if (!(e instanceof WooError) || e.status >= 500) throw e;
    }
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Clock className="mx-auto size-10 text-ink-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold">نمایش این سفارش ممکن نیست</h1>
        <p className="mt-2 text-ink-600">برای حفظ حریم خصوصی، جزئیات سفارش فقط در همان مرورگری که سفارش را ثبت کرده نمایش داده می‌شود. برای پیگیری با پشتیبانی تماس بگیرید: <span className="ltr">{SITE.phone}</span></p>
        <Button href="/" className="mt-6">بازگشت به فروشگاه</Button>
      </div>
    );
  }
  const ok = ["processing", "completed", "on-hold", "pending"].includes(order.status);
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="text-center" data-testid="order-confirmation">
        <CheckCircle2 className="mx-auto size-12 text-success-600" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold">{ok ? "سفارش شما ثبت شد" : "وضعیت سفارش"}</h1>
        <p className="mt-2 text-ink-600">شماره سفارش: <strong>{toFaDigits(order.id)}</strong> · وضعیت: {STATUS[order.status] ?? order.status}</p>
        {SITE.demoMode && <p className="mx-auto mt-4 max-w-md rounded-sm bg-bronze-100 p-3 text-sm leading-7 text-bronze-700">این یک سفارش آزمایشی در فروشگاه نمایشی است؛ پرداخت واقعی انجام نشده و کالایی ارسال نخواهد شد.</p>}
      </div>
      <section aria-labelledby="oi" className="mt-10 rounded-sm border border-line bg-ivory-50 p-6">
        <h2 id="oi" className="mb-4 text-lg font-bold">اقلام سفارش</h2>
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4 py-3 text-sm"><span>{i.name} × {toFaDigits(i.quantity)}</span><span>{formatToman(Number(i.totals.line_total))}</span></li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink-600">ارسال</dt><dd>{Number(order.totals.total_shipping) === 0 ? "رایگان" : formatToman(Number(order.totals.total_shipping))}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>جمع کل</dt><dd>{formatToman(Number(order.totals.total_price))}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-ink-600">تحویل به: {order.billing_address.first_name} {order.billing_address.last_name}، {order.billing_address.city}، {order.billing_address.address_1}</p>
      </section>
      <div className="mt-8 text-center"><Button href="/collections/all" variant="secondary">ادامه خرید</Button></div>
    </div>
  );
}
