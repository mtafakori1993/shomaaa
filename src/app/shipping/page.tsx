import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "ارسال و تحویل", description: "هزینه، روش‌ها و زمان ارسال سفارش‌ها در فروشگاه شوما.", alternates: { canonical: "/shipping" } };

export default function Shipping() {
  return (
    <PageShell title="ارسال و تحویل" lead="سفارش‌ها به سراسر ایران ارسال می‌شوند.">
      <p className="rounded-sm bg-ivory-200 p-4 text-sm leading-8 text-ink-700">این متن برای ویترین نمایشی نوشته شده است؛ پیش از راه‌اندازی فروش واقعی باید با شرایط دقیق فروشنده تطبیق داده شود.</p>
      <h2>روش‌ها و هزینه</h2>
      <ul><li>ارسال با پیک یا پست پیشتاز: ۱۸۰ هزار تومان</li><li>ارسال رایگان برای سفارش‌های بالای ۱۵ میلیون تومان (پس از اعمال تخفیف)</li></ul>
      <h2>زمان تحویل</h2>
      <p>زمان تحویل پس از ثبت و تأیید سفارش توسط پشتیبانی اعلام می‌شود و به مقصد و موجودی کالا بستگی دارد.</p>
      <h2>تحویل و بررسی کالا</h2>
      <p>هنگام تحویل، بسته را بررسی کنید. در صورت آسیب ظاهری بسته، موضوع را همان لحظه به پشتیبانی اطلاع دهید.</p>
    </PageShell>
  );
}
