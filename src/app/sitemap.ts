import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { listCategories, listProducts } from "@/lib/woo/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics = ["", "/collections/all", "/about", "/contact", "/faq", "/shipping", "/returns", "/privacy", "/terms"].map((p) => ({ url: `${SITE.url}${p}`, lastModified: now }));
  try {
    const [cats, products] = await Promise.all([listCategories(), listProducts({ perPage: 100 })]);
    return [
      ...statics,
      ...cats.map((c) => ({ url: `${SITE.url}/collections/${c.slug}`, lastModified: now })),
      ...products.products.map((p) => ({ url: `${SITE.url}/products/${p.slug}`, lastModified: now })),
    ];
  } catch {
    return statics;
  }
}
