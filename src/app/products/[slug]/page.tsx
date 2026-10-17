import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "radix-ui";
import { ChevronDown, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/shop/product-card";
import { ProductView } from "@/components/shop/product-view";
import { Badge, Breadcrumbs } from "@/components/ui/misc";
import { SITE } from "@/lib/config";
import { getProduct, relatedProducts } from "@/lib/woo/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug).catch(() => null);
  if (!p) return { title: "محصول پیدا نشد", robots: { index: false } };
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || p.shortDescription;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", title, description, url: `/products/${p.slug}`, images: p.image ? [{ url: p.image.src, alt: p.image.alt }] : undefined },
  };
}

const abs = (u: string) => (u.startsWith("http") ? u : `${SITE.url}${u}`);

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const related = await relatedProducts(p).catch(() => []);
  const cat = p.categories[0];

  const prices = p.variations.length ? p.variations.filter((v) => v.inStock).map((v) => v.price) : [p.price];
  const lowPrice = prices.length ? Math.min(...prices) : p.price;
  const highPrice = prices.length ? Math.max(...prices) : p.price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.shortDescription,
    image: p.images.map((i) => abs(i.src)),
    category: cat?.name,
    material: p.material || undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IRR",
      // Schema.org has no IRT: prices are converted from toman to rial (×10) so the currency code is valid.
      lowPrice: lowPrice * 10,
      highPrice: highPrice * 10,
      offerCount: Math.max(1, p.variations.length),
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE.url}/products/${p.slug}`,
    },
  };
  const crumbs = [{ label: "خانه", href: "/" }, ...(cat ? [{ label: cat.name, href: `/collections/${cat.slug}` }] : []), { label: p.name }];
  const colorAttr = p.attributes.find((a) => a.taxonomy === "pa_color");
  const specs: [string, string][] = ([["کد محصول", p.sku], ["جنس", p.material], ["برش", p.fit], ["رنگ", colorAttr ? colorAttr.terms.map((t) => t.name).join("، ") : ""]] as [string, string][]).filter(([, v]) => v);

  const info = [
    { icon: Truck, t: "ارسال به سراسر ایران", d: "ارسال با پیک یا پست پیشتاز؛ زمان تحویل پس از ثبت سفارش اعلام می‌شود. خرید بالای ۱۵ میلیون تومان ارسال رایگان دارد." },
    { icon: RefreshCcw, t: "بازگشت و تعویض", d: "تا ۷ روز پس از تحویل، در صورت سالم بودن کالا و برچسب‌ها، امکان تعویض سایز یا بازگشت وجود دارد." },
    { icon: ShieldCheck, t: "پرداخت و حریم خصوصی", d: "اطلاعات شما فقط برای ثبت و ارسال سفارش استفاده می‌شود." },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <JsonLd data={jsonLd} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? `${SITE.url}${c.href}` : `${SITE.url}/products/${p.slug}` })) }} />
      <div className="mb-6"><Breadcrumbs items={crumbs} /></div>
      <ProductView product={p} />

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="desc-h">
          <h2 id="desc-h" className="mb-4 text-xl font-bold">توضیحات محصول</h2>
          <div className="prose-fa space-y-4 leading-8 text-ink-700 [&_em]:text-ink-600 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink-900 [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pr-5" dangerouslySetInnerHTML={{ __html: p.description }} />
        </section>
        <div className="space-y-8">
          <section aria-labelledby="spec-h">
            <h2 id="spec-h" className="mb-4 text-xl font-bold">مشخصات</h2>
            <dl className="divide-y divide-line border-y border-line">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-ink-600">{k}</dt><dd className="font-medium">{k === "کد محصول" ? <span className="ltr">{v}</span> : v}</dd></div>
              ))}
            </dl>
          </section>
          <Accordion.Root type="single" collapsible defaultValue="i0" className="border-t border-line">
            {info.map((it, i) => (
              <Accordion.Item key={it.t} value={`i${i}`} className="border-b border-line">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex min-h-14 w-full items-center gap-3 text-start font-medium">
                    <it.icon className="size-5 text-bronze-600" aria-hidden />{it.t}
                    <ChevronDown className="mr-auto size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="pb-5 pr-8 text-sm leading-7 text-ink-700">{it.d}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
          {p.isSample && <Badge tone="accent" className="!whitespace-normal !py-1.5 leading-6">نمونه آزمایشی: این محصول برای نمایش ویترین است و قبل از فروش واقعی باید جایگزین شود.</Badge>}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-20">
          <h2 id="rel-h" className="mb-6 text-2xl font-bold">محصولات مرتبط</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
