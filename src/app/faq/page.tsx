import type { Metadata } from "next";
import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "پرسش‌های متداول", description: "پاسخ پرسش‌های رایج درباره سایز، ارسال، پرداخت و تعویض در فروشگاه شوما.", alternates: { canonical: "/faq" } };

const faq = [
  ["سایز مناسب خود را چگونه انتخاب کنم؟", "در صفحه هر محصول، برش (اسلیم، رگولار و …) و بازه سایزها نوشته شده است. اگر بین دو سایز مردد هستید، با پشتیبانی تماس بگیرید."],
  ["هزینه و زمان ارسال چقدر است؟", "هزینه ارسال پیش‌فرض ۱۸۰ هزار تومان است و برای خرید بالای ۱۵ میلیون تومان رایگان می‌شود. جزئیات در صفحه «ارسال و تحویل» آمده است."],
  ["آیا می‌توانم سایز را تعویض کنم؟", "بله؛ تا ۷ روز پس از تحویل، در صورت استفاده‌نشدن و سالم بودن برچسب‌ها. شرایط کامل در صفحه «بازگشت و تعویض» است."],
  ["پرداخت چگونه انجام می‌شود؟", "این فروشگاه در حالت نمایشی است و درگاه پرداخت واقعی متصل نیست؛ ثبت سفارش بدون برداشت وجه انجام می‌شود."],
  ["آیا تصاویر، عکس خود کالا هستند؟", "خیر. تصاویر این ویترین با هوش مصنوعی تصویرسازی شده‌اند و در صفحه محصول نیز به آن اشاره شده است."],
  ["چگونه کد تخفیف را اعمال کنم؟", "در صفحه سبد خرید یا تسویه حساب، کد را در بخش «کد تخفیف» وارد کنید. برای نمونه، کد WELCOME10 ده درصد تخفیف می‌دهد."],
] as const;

export default function Faq() {
  return (
    <PageShell title="پرسش‌های متداول">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
      <Accordion.Root type="single" collapsible className="border-t border-line !mt-0">
        {faq.map(([q, a], i) => (
          <Accordion.Item key={q} value={`q${i}`} className="border-b border-line">
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 text-start font-medium text-ink-900">
                {q}<ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-5">{a}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </PageShell>
  );
}
