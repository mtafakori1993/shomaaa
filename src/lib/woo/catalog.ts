/* eslint-disable @typescript-eslint/no-explicit-any -- raw WooCommerce Store API payloads are mapped to typed models in mappers.ts */
import "server-only";
import { cache } from "react";
import { storeFetch, WooError } from "./client";
import { mapCategory, mapDetail, mapSummary, mapVariation } from "./mappers";
import type { Category, ListParams, ListResult, ProductDetail, ProductSummary } from "./types";

const REVALIDATE = 120; // seconds; invalidated on demand via POST /api/revalidate (tag "catalog")
const TAGS = ["catalog"];

function toQuery(p: ListParams): string {
  const q = new URLSearchParams();
  q.set("per_page", String(p.perPage ?? 12));
  q.set("page", String(p.page ?? 1));
  if (p.category) q.set("category", p.category);
  if (p.search) q.set("search", p.search);
  if (p.orderby) q.set("orderby", p.orderby);
  if (p.order) q.set("order", p.order);
  if (p.minPrice) q.set("min_price", String(p.minPrice));
  if (p.maxPrice) q.set("max_price", String(p.maxPrice));
  if (p.onSale) q.set("on_sale", "true");
  if (p.inStock) q.set("stock_status", "instock");
  if (p.tag) q.set("tag", p.tag);
  if (p.include?.length) q.set("include", p.include.join(","));
  if (p.exclude?.length) q.set("exclude", p.exclude.join(","));
  const attrs: { attribute: string; term: string }[] = [];
  p.sizes?.forEach((s) => attrs.push({ attribute: "pa_size", term: s }));
  p.colors?.forEach((c) => attrs.push({ attribute: "pa_color", term: c }));
  // Store API: attributes[n][attribute]=pa_size&attributes[n][slug]=...  (grouped OR within one attribute)
  const bySlug = new Map<string, string[]>();
  attrs.forEach((a) => bySlug.set(a.attribute, [...(bySlug.get(a.attribute) ?? []), a.term]));
  let i = 0;
  for (const [attribute, terms] of bySlug) {
    q.set(`attributes[${i}][attribute]`, attribute);
    q.set(`attributes[${i}][slug]`, terms.join(","));
    q.set(`attributes[${i}][operator]`, "in");
    i++;
  }
  if (bySlug.size > 1) q.set("attribute_relation", "and");
  return q.toString();
}

export async function listProducts(params: ListParams = {}): Promise<ListResult> {
  const { data, headers } = await storeFetch<unknown[]>(`/products?${toQuery(params)}`, { revalidate: REVALIDATE, tags: TAGS });
  return {
    products: data.map(mapSummary),
    total: Number(headers.get("X-WP-Total") ?? data.length),
    totalPages: Number(headers.get("X-WP-TotalPages") ?? 1),
  };
}

export const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    const { data } = await storeFetch<any[]>(`/products?slug=${encodeURIComponent(slug)}&per_page=1`, { revalidate: REVALIDATE, tags: TAGS });
    const raw = data[0];
    if (!raw) return null;
    let variations: ReturnType<typeof mapVariation>[] = [];
    if (raw.type === "variable") {
      const { data: vs } = await storeFetch<any[]>(`/products?parent=${raw.id}&type=variation&per_page=100`, { revalidate: REVALIDATE, tags: TAGS });
      variations = vs.map((v) => mapVariation(v, raw.variations ?? []));
    }
    return mapDetail(raw, variations);
  } catch (e) {
    if (e instanceof WooError && e.status === 404) return null;
    throw e;
  }
});

export const listCategories = cache(async (): Promise<Category[]> => {
  const { data } = await storeFetch<unknown[]>(`/products/categories?per_page=100&hide_empty=true`, { revalidate: 600, tags: TAGS });
  return data.map(mapCategory).filter((c) => c.slug !== "uncategorized");
});

export interface Facets {
  price: { min: number; max: number } | null;
  sizes: { slug: string; name: string; count: number }[];
  colors: { slug: string; name: string; count: number }[];
}

/** Price range + attribute counts for the filter panel (scoped to a category). */
export async function getFacets(category?: string): Promise<Facets> {
  const calc = ["price_range", "attribute_counts"].map((c) => `calculate_${c}=true`);
  const q = new URLSearchParams();
  if (category) q.set("calculation_category", category);
  const [{ data }, { data: sizeTerms }, { data: colorTerms }] = await Promise.all([
    storeFetch<any>(`/products/collection-data?${calc.join("&")}&calculate_attribute_counts[0][taxonomy]=pa_size&calculate_attribute_counts[0][query_type]=or&calculate_attribute_counts[1][taxonomy]=pa_color&calculate_attribute_counts[1][query_type]=or${category ? `&category=${category}` : ""}`, { revalidate: REVALIDATE, tags: TAGS }),
    storeFetch<any[]>(`/products/attributes/${await attributeId("size")}/terms?per_page=100&orderby=menu_order`, { revalidate: 600, tags: TAGS }),
    storeFetch<any[]>(`/products/attributes/${await attributeId("color")}/terms?per_page=100`, { revalidate: 600, tags: TAGS }),
  ]);
  const counts = (tax: string) => new Map<string, number>((data.attribute_counts ?? []).filter((c: any) => c.taxonomy === tax).map((c: any) => [String(c.term), c.count]));
  // attribute_counts are keyed by term id
  const sc = counts("pa_size");
  const cc = counts("pa_color");
  const pick = (terms: any[], c: Map<string, number>) =>
    terms.filter((t) => c.has(String(t.id))).map((t) => ({ slug: t.slug, name: t.name, count: c.get(String(t.id)) ?? 0 }));
  const pr = data.price_range;
  return {
    price: pr ? { min: Number(pr.min_price), max: Number(pr.max_price) } : null,
    sizes: pick(sizeTerms, sc),
    colors: pick(colorTerms, cc),
  };
}

const attributeId = cache(async (slug: string): Promise<number> => {
  const { data } = await storeFetch<any[]>(`/products/attributes`, { revalidate: 3600, tags: TAGS });
  const a = data.find((x) => x.taxonomy === `pa_${slug}`);
  if (!a) throw new WooError(404, `attribute ${slug} missing`);
  return a.id;
});

export async function relatedProducts(product: ProductDetail, limit = 4): Promise<ProductSummary[]> {
  const cat = product.categories[0]?.slug;
  const { products } = await listProducts({ category: cat, perPage: limit + 1, exclude: [product.id] });
  return products.slice(0, limit);
}
