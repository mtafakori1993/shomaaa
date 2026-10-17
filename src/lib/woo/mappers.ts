import type { Cart, CartItem, Category, ProductDetail, ProductImage, ProductSummary, Variation } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

const num = (v: unknown) => (v === undefined || v === null || v === "" ? 0 : Number(v));

/** Strip the WordPress origin so images are served same-origin via the /wp-content rewrite. */
export function localizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export const mapImage = (i: Raw): ProductImage => ({ id: i.id, src: localizeUrl(i.src), alt: i.alt || i.name || "" });

const strip = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

export function mapSummary(p: Raw): ProductSummary {
  const pr = p.prices ?? {};
  const range = pr.price_range;
  const colorAttr = (p.attributes ?? []).find((a: Raw) => a.taxonomy === "pa_color");
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    type: p.type === "variable" ? "variable" : "simple",
    price: num(pr.price),
    regularPrice: num(pr.regular_price),
    salePrice: p.on_sale ? num(pr.sale_price) : null,
    priceMax: range ? num(range.max_amount) : null,
    inStock: !!p.is_in_stock,
    lowStock: p.low_stock_remaining ?? null,
    image: p.images?.[0] ? mapImage(p.images[0]) : null,
    hoverImage: p.images?.[1] ? mapImage(p.images[1]) : null,
    categories: (p.categories ?? []).map((c: Raw) => ({ id: c.id, slug: c.slug, name: c.name })),
    colors: (colorAttr?.terms ?? []).map((t: Raw) => ({ id: t.id, name: t.name, slug: t.slug })),
    shortDescription: strip(p.short_description ?? ""),
  };
}

export function mapDetail(p: Raw, variations: Variation[]): ProductDetail {
  const ext = p.extensions?.shomaaa ?? {};
  return {
    ...mapSummary(p),
    description: p.description ?? "",
    images: (p.images ?? []).map(mapImage),
    attributes: (p.attributes ?? []).filter((a: Raw) => a.taxonomy).map((a: Raw) => ({
      id: a.id, name: a.name, taxonomy: a.taxonomy, hasVariations: !!a.has_variations,
      terms: (a.terms ?? []).map((t: Raw) => ({ id: t.id, name: t.name, slug: t.slug })),
    })),
    variations,
    material: ext.material ?? "",
    fit: ext.fit ?? "",
    seoTitle: ext.seo_title ?? "",
    seoDescription: ext.seo_description ?? "",
    tags: (p.tags ?? []).map((t: Raw) => ({ id: t.id, name: t.name })),
    isSample: !!ext.sample,
  };
}

/** The Store API names variation attributes by their label (e.g. "سایز"); map them back to the taxonomy (pa_size). */
export function mapVariation(v: Raw, refs: Raw[], attrDefs: Raw[]): Variation {
  const ref = refs.find((r) => r.id === v.id);
  const taxByLabel = new Map<string, string>(attrDefs.filter((a) => a.taxonomy).map((a) => [a.name, a.taxonomy]));
  const attributes: Record<string, string> = {};
  for (const a of ref?.attributes ?? []) attributes[taxByLabel.get(a.name) ?? a.name] = a.value;
  const pr = v.prices ?? {};
  return {
    id: v.id,
    attributes,
    price: num(pr.price),
    regularPrice: num(pr.regular_price),
    salePrice: v.on_sale ? num(pr.sale_price) : null,
    inStock: !!v.is_in_stock,
    lowStock: v.low_stock_remaining ?? null,
    image: v.images?.[0] ? mapImage(v.images[0]) : null,
  };
}

export function mapCategory(c: Raw): Category {
  return { id: c.id, slug: c.slug, name: c.name, parent: c.parent, count: c.count, description: strip(c.description ?? "") };
}

export function mapCart(c: Raw): Cart {
  const t = c.totals ?? {};
  const pkg = c.shipping_rates?.[0];
  const items: CartItem[] = (c.items ?? []).map((i: Raw) => ({
    key: i.key,
    id: i.id,
    name: i.name,
    slug: String(i.permalink ?? "").split("/").filter(Boolean).pop() ?? "",
    sku: i.sku,
    quantity: i.quantity,
    maxQuantity: i.quantity_limits?.maximum ?? 99,
    unitPrice: num(i.prices?.price),
    regularUnitPrice: num(i.prices?.regular_price),
    lineTotal: num(i.totals?.line_total),
    image: i.images?.[0] ? mapImage(i.images[0]) : null,
    variation: (i.variation ?? []).map((v: Raw) => ({ attribute: v.attribute, value: v.value })),
  }));
  return {
    items,
    itemsCount: c.items_count ?? items.reduce((s, i) => s + i.quantity, 0),
    subtotal: num(t.total_items),
    discount: num(t.total_discount),
    shipping: pkg?.shipping_rates?.some((r: Raw) => r.selected) ? num(t.total_shipping) : null,
    total: num(t.total_price),
    coupons: (c.coupons ?? []).map((k: Raw) => ({ code: k.code, discount: num(k.totals?.total_discount) })),
    shippingRates: (pkg?.shipping_rates ?? []).map((r: Raw) => ({ rateId: r.rate_id, name: r.name, cost: num(r.price), selected: !!r.selected })),
    packageId: pkg?.package_id ?? null,
    needsShipping: !!c.needs_shipping,
  };
}
