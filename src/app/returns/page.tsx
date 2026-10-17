import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "بازگشت و تعویض", description: "شرایط تعویض سایز و بازگشت کالا در فروشگاه شوما.", alternates: { canonical: "/returns" } };

export default function Returns() {
  return (
    <PageShell title="بازگشت و تعویض" lead="اگر سایز یا مدل مناسب نبود، تا ۷ روز فرصت تعویض یا بازگشت دارید.">
      <p className="rounded-sm bg-ivory-200 p-4 text-sm leading-8 text-ink-700">این متن برای ویترین نمایشی نوشته شده است؛ پیش از راه‌اندازی فروش واقعی باید با شرایط دقیق فروشنده تطبیق داده شود.</p>
      <h2>شرایط</h2>
      <ul><li>کالا استفاده یا شسته نشده و برچسب‌ها سالم باشد.</li><li>درخواست حداکثر ۷ روز پس از تحویل ثبت شود.</li><li>کالاهای ساخته‌شده بر اساس سفارش اختصاصی قابل بازگشت نیستند.</li></ul>
      <h2>روش درخواست</h2>
      <p>با شماره سفارش با پشتیبانی تماس بگیرید. پس از تأیید، نحوه ارسال کالا اعلام می‌شود.</p>
    </PageShell>
  );
}
