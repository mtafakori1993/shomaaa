import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "تماس با ما", description: "راه‌های ارتباط با پشتیبانی شوما؛ تلفن و ایمیل.", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <PageShell title="تماس با ما" lead="برای راهنمایی انتخاب سایز، پیگیری سفارش یا هر پرسش دیگر با ما در تماس باشید.">
      <ul className="grid gap-4 sm:grid-cols-2">
        <li className="flex items-start gap-4 rounded-sm border border-line bg-ivory-50 p-6">
          <Phone className="mt-1 size-6 text-bronze-600" aria-hidden />
          <div><h2 className="!mt-0 text-base">تلفن پشتیبانی</h2><a href={`tel:${SITE.phone}`} className="ltr text-xl font-bold no-underline" data-testid="support-phone">{SITE.phone}</a></div>
        </li>
        <li className="flex items-start gap-4 rounded-sm border border-line bg-ivory-50 p-6">
          <Mail className="mt-1 size-6 text-bronze-600" aria-hidden />
          <div><h2 className="!mt-0 text-base">ایمیل</h2><a href={`mailto:${SITE.email}`} className="ltr text-lg font-bold no-underline" data-testid="support-email">{SITE.email}</a></div>
        </li>
      </ul>
      <p>هنگام پیگیری سفارش، شماره سفارش و شماره موبایل ثبت‌شده را همراه داشته باشید.</p>
    </PageShell>
  );
}
