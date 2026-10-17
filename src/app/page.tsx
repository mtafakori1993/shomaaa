import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gem, RefreshCcw, Ruler, Truck } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { ProductGrid } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";
import { listProducts } from "@/lib/woo/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | کت‌وشلوار و پوشاک رسمی مردانه و زنانه` },
  alternates: { canonical: "/" },
};

const tiles = [
  { href: "/collections/men", title: "مردانه", sub: "کت‌وشلوار، پیراهن و جلیقه", img: "/media/editorial/cat-men.webp", alt: "مدل مرد با کت‌وشلوار سرمه‌ای؛ تصویر نمونه" },
  { href: "/collections/women", title: "زنانه", sub: "ست رسمی، بلیزر و مجلسی", img: "/media/editorial/cat-women.webp", alt: "مدل زن با بلیزر زیتونی و کیف چرمی؛ تصویر نمونه" },
  { href: "/collections/accessories", title: "اکسسوری", sub: "کراوات، کمربند، کیف و کفش", img: "/media/editorial/cat-accessories.webp", alt: "کراوات ابریشمی، کمربند چرم، دکمه سردست و کفش اکسفورد؛ تصویر نمونه" },
];

const trust = [
  { icon: Truck, t: "ارسال به سراسر ایران", d: "پیک و پست پیشتاز؛ ارسال رایگان بالای ۱۵ میلیون تومان" },
  { icon: RefreshCcw, t: "تعویض سایز", d: "تا ۷ روز پس از تحویل، با شرایط شفاف" },
  { icon: Ruler, t: "راهنمای سایز", d: "جدول سایز و برش در صفحه هر محصول" },
  { icon: Gem, t: "دوخت و پارچه", d: "مشخصات جنس و برش برای هر کالا" },
];

async function safe<T>(p: Promise<T>): Promise<T | null> { try { return await p; } catch { return null; } }

export default async function Home() {
  const [fresh, featured] = await Promise.all([
    safe(listProducts({ orderby: "date", order: "desc", perPage: 8 })),
    safe(listProducts({ orderby: "price", order: "desc", perPage: 4, inStock: true })),
  ]);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "fa-IR", potentialAction: { "@type": "SearchAction", target: `${SITE.url}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, email: SITE.email, telephone: SITE.phone }} />

      {/* Hero */}
      <section aria-labelledby="hero-h" className="relative overflow-hidden bg-ivory-200">
        <div className="mx-auto grid max-w-[1440px] items-stretch lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:py-24 lg:pr-16">
            <p className="font-display text-sm font-medium tracking-[0.4em] text-bronze-600" dir="ltr">AUTUMN / WINTER</p>
            <h1 id="hero-h" className="text-4xl font-bold leading-[1.35] sm:text-5xl lg:text-6xl lg:leading-[1.3]">
              دوخت دقیق،<br />حضوری که <span className="text-bronze-600">به یاد می‌ماند</span>
            </h1>
            <p className="max-w-lg text-lg leading-9 text-ink-700">کت‌وشلوار، بلیزر و پوشاک رسمی مردانه و زنانه؛ با پارچه‌هایی انتخاب‌شده، برش‌هایی تمیز و اکسسوری‌هایی که لباس شما را کامل می‌کنند.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button href="/collections/men" size="lg">مجموعه مردانه</Button>
              <Button href="/collections/women" size="lg" variant="secondary">مجموعه زنانه</Button>
            </div>
          </div>
          <div className="relative min-h-[420px] lg:min-h-[640px]">
            <Image src="/media/editorial/hero.webp" alt="مدل مرد با کت‌وشلوار پشمی ذغالی در آتلیه؛ تصویر کمپین نمونه" fill priority sizes="(min-width:1024px) 48vw, 100vw" quality={75} className="object-cover object-top" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="cat-h" className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6">
        <h2 id="cat-h" className="mb-8 text-2xl font-bold sm:text-3xl">دسته‌بندی‌ها</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {tiles.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="group relative block aspect-[4/5] overflow-hidden rounded-xs bg-ivory-200">
                <Image src={t.img} alt={t.alt} fill sizes="(min-width:768px) 32vw, 100vw" quality={75} className="object-cover transition-transform duration-700 ease-out-quart group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 to-transparent p-5 pt-16 text-ivory-50" data-on-dark>
                  <span className="block text-2xl font-bold">{t.title}</span>
                  <span className="mt-1 flex items-center justify-between text-sm text-ivory-200">{t.sub}<ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" aria-hidden /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="new-h" className="mx-auto max-w-[1440px] px-4 pt-24 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="new-h" className="text-2xl font-bold sm:text-3xl">تازه‌های شوما</h2>
          <Link href="/collections/all?sort=date" className="text-sm font-medium underline underline-offset-4">همه محصولات</Link>
        </div>
        {fresh ? <ProductGrid products={fresh.products} /> : <p role="status" className="rounded-sm bg-ivory-200 p-6 text-center text-ink-600">محصولات در حال حاضر بارگذاری نمی‌شوند. لطفاً کمی بعد دوباره سر بزنید.</p>}
      </section>

      {/* Editorial */}
      <section aria-labelledby="ed-h" className="mx-auto mt-24 max-w-[1440px] px-4 sm:px-6">
        <div className="grid items-center gap-8 overflow-hidden rounded-xs bg-olive-700 text-ivory-100 md:grid-cols-2" data-on-dark>
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[560px]">
            <Image src="/media/editorial/campaign-women.webp" alt="مدل زن با کت و شلوار کرم در فضایی گرم؛ تصویر کمپین نمونه" fill sizes="(min-width:768px) 48vw, 100vw" quality={75} className="object-cover" />
          </div>
          <div className="space-y-5 p-8 sm:p-12 lg:p-16">
            <p className="font-display text-sm tracking-[0.4em] text-bronze-300" dir="ltr">THE EDIT</p>
            <h2 id="ed-h" className="text-3xl font-bold leading-[1.5] sm:text-4xl">سادگی که رسمی می‌ماند</h2>
            <p className="max-w-md leading-9 text-ivory-200">کرپ، پشم و کتان در رنگ‌های خاکی و آرام؛ ست‌هایی که از جلسه صبح تا مهمانی شب با شما همراه‌اند.</p>
            <Button href="/collections/women-suits" variant="accent" size="lg">مشاهده ست‌های زنانه</Button>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section aria-labelledby="feat-h" className="mx-auto max-w-[1440px] px-4 pt-24 sm:px-6">
        <h2 id="feat-h" className="mb-8 text-2xl font-bold sm:text-3xl">منتخب شوما</h2>
        {featured ? <ProductGrid products={featured.products} /> : null}
      </section>

      {/* Seasonal banner */}
      <section aria-label="مجموعه فصلی" className="mx-auto mt-24 max-w-[1440px] px-4 sm:px-6">
        <Link href="/collections/all?onsale=1" className="group relative block overflow-hidden rounded-xs">
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <Image src="/media/editorial/seasonal.webp" alt="رگال لباس‌های رسمی در آتلیه؛ تصویر نمونه" fill sizes="100vw" quality={75} className="object-cover transition-transform duration-700 ease-out-quart group-hover:scale-[1.03]" />
          </div>
          <div className="absolute inset-0 flex items-center bg-gradient-to-l from-ink-950/65 via-ink-950/25 to-transparent p-6 sm:p-14" data-on-dark>
            <div className="max-w-md space-y-3 text-ivory-50">
              <p className="font-display text-sm tracking-[0.4em] text-bronze-300" dir="ltr">SEASONAL</p>
              <h2 className="text-2xl font-bold sm:text-4xl">فروش ویژه پاییزی</h2>
              <span className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">دیدن کالاهای تخفیف‌دار <ArrowLeft className="size-4" aria-hidden /></span>
            </div>
          </div>
        </Link>
      </section>

      {/* Trust */}
      <section aria-label="خدمات فروشگاه" className="mx-auto mt-24 max-w-[1440px] px-4 sm:px-6">
        <ul className="grid gap-px overflow-hidden rounded-xs border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <li key={t.t} className="flex items-start gap-4 bg-ivory-50 p-6">
              <t.icon className="mt-1 size-6 shrink-0 text-bronze-600" aria-hidden />
              <div><h3 className="font-bold">{t.t}</h3><p className="mt-1 text-sm leading-7 text-ink-600">{t.d}</p></div>
            </li>
          ))}
        </ul>
      </section>

      {/* Newsletter */}
      <section aria-labelledby="nl-h" className="mx-auto mt-24 max-w-[1440px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-6 rounded-xs bg-ivory-200 p-6 sm:p-12 md:grid-cols-2 [&>*]:min-w-0">
          <div>
            <h2 id="nl-h" className="text-2xl font-bold">از تازه‌ها زودتر باخبر شوید</h2>
            <p className="mt-2 text-ink-600">ایمیل خود را وارد کنید تا خبر مجموعه‌های جدید و تخفیف‌ها را دریافت کنید.</p>
          </div>
          <NewsletterForm tone="light" />
        </div>
      </section>
    </>
  );
}
