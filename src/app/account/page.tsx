import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "حساب کاربری و پیگیری سفارش", robots: { index: false, follow: true } };

export default function Account() {
  return (
    <PageShell title="حساب کاربری و پیگیری سفارش" crumb="حساب کاربری">
      <p>خرید در شوما بدون ساخت حساب کاربری انجام می‌شود (خرید مهمان). ورود با حساب کاربری و تاریخچه سفارش‌ها هنوز در این نسخه فعال نشده است.</p>
      <h2>پیگیری سفارش</h2>
      <p>برای پیگیری، شماره سفارش و شماره موبایل ثبت‌شده را به پشتیبانی بگویید: <a href={`tel:${SITE.phone}`} className="ltr">{SITE.phone}</a> یا <a href={`mailto:${SITE.email}`} className="ltr">{SITE.email}</a></p>
      <Button href="/collections/all">ادامه خرید</Button>
    </PageShell>
  );
}
