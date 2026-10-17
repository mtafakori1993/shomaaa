import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/lib/config";
import { NewsletterForm } from "./newsletter-form";

const cols = [
  { title: "فروشگاه", links: [
    ["مردانه", "/collections/men"], ["زنانه", "/collections/women"], ["اکسسوری", "/collections/accessories"], ["تخفیف‌ها", "/collections/all?onsale=1"],
  ] },
  { title: "راهنما", links: [
    ["ارسال و تحویل", "/shipping"], ["بازگشت و تعویض", "/returns"], ["پرسش‌های متداول", "/faq"], ["تماس با ما", "/contact"],
  ] },
  { title: "شوما", links: [
    ["درباره برند", "/about"], ["حریم خصوصی", "/privacy"], ["قوانین و مقررات", "/terms"], ["پیگیری سفارش", "/account"],
  ] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-ivory-200" data-on-dark>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_2fr_1.2fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <Logo onDark />
          <p className="max-w-sm text-sm leading-7 text-ivory-300">پوشاک رسمی مردانه و زنانه با دوخت دقیق؛ از کت‌وشلوار روزانه تا لباس مجلسی.</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="size-4 text-bronze-300" aria-hidden /><span>پشتیبانی:</span><a href={`tel:${SITE.phone}`} className="ltr hover:underline">{SITE.phone}</a></li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-bronze-300" aria-hidden /><a href={`mailto:${SITE.email}`} className="ltr break-all hover:underline">{SITE.email}</a></li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="mb-4 text-sm font-bold text-ivory-50">{c.title}</h2>
              <ul className="space-y-1">
                {c.links.map(([l, h]) => (
                  <li key={h}><Link href={h} className="flex min-h-9 items-center text-sm text-ivory-300 hover:text-ivory-50 hover:underline">{l}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div>
          <h2 className="mb-2 text-sm font-bold text-ivory-50">خبرنامه شوما</h2>
          <p className="mb-4 text-sm text-ivory-300">از مجموعه‌های تازه و تخفیف‌ها زودتر مطلع شوید.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-ink-700">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-xs text-ivory-300 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false })} شوما · این فروشگاه نمایشی است و تصاویر محصولات تصویرسازی‌شده‌اند، نه عکس کالای موجود.</p>
          <p>
            <a href={SITE.attribution.href} target="_blank" rel="noopener" className="hover:text-ivory-50 hover:underline">{SITE.attribution.text}</a>
            <span className="ltr mr-2 text-ivory-300/70">{SITE.attribution.domain}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
