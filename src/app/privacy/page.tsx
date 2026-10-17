import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "حریم خصوصی", description: "نحوه جمع‌آوری و استفاده از اطلاعات کاربران در فروشگاه شوما.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <PageShell title="حریم خصوصی">
      <p className="rounded-sm bg-ivory-200 p-4 text-sm leading-8 text-ink-700">این متن برای ویترین نمایشی نوشته شده است؛ پیش از راه‌اندازی فروش واقعی باید با شرایط دقیق فروشنده تطبیق داده شود.</p>
      <h2>چه اطلاعاتی دریافت می‌کنیم</h2>
      <p>برای ثبت سفارش: نام، شماره موبایل، ایمیل و نشانی تحویل. برای خبرنامه: فقط ایمیل شما.</p>
      <h2>استفاده از اطلاعات</h2>
      <p>اطلاعات تنها برای پردازش و ارسال سفارش، پشتیبانی و (در صورت عضویت) ارسال خبرنامه استفاده می‌شود و فروخته نمی‌شود.</p>
      <h2>کوکی‌ها</h2>
      <p>فقط یک کوکی ضروری برای نگهداری سبد خرید استفاده می‌شود. ابزار تبلیغاتی یا ردیابی شخص ثالث بارگذاری نمی‌شود.</p>
      <h2>تماس</h2>
      <p>برای حذف یا اصلاح اطلاعات به <a href={`mailto:${SITE.email}`}>{SITE.email}</a> پیام دهید.</p>
    </PageShell>
  );
}
