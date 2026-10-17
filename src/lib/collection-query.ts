import type { ListParams } from "@/lib/woo/types";

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (first(v) ?? "").split(",").map((s) => s.trim()).filter((s) => /^[\w-]+$/.test(s)).slice(0, 12);
const int = (v: string | string[] | undefined) => { const n = Number(first(v)); return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined; };

export const PER_PAGE = 12;

export function parseCollectionQuery(sp: SP, category?: string): { params: ListParams; page: number } {
  const sort = first(sp.sort) ?? "date";
  const orderMap: Record<string, Pick<ListParams, "orderby" | "order">> = {
    date: { orderby: "date", order: "desc" },
    "price-asc": { orderby: "price", order: "asc" },
    "price-desc": { orderby: "price", order: "desc" },
    title: { orderby: "title", order: "asc" },
    popularity: { orderby: "popularity", order: "desc" },
  };
  const page = Math.min(int(sp.page) ?? 1, 200);
  return {
    page,
    params: {
      category: category && category !== "all" ? category : undefined,
      ...(orderMap[sort] ?? orderMap.date),
      page, perPage: PER_PAGE,
      minPrice: int(sp.min), maxPrice: int(sp.max),
      onSale: first(sp.onsale) === "1", inStock: first(sp.instock) === "1",
      sizes: list(sp.size), colors: list(sp.color),
      search: first(sp.q)?.slice(0, 60),
    },
  };
}
