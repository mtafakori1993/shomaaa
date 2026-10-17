import "server-only";
import { WORDPRESS_URL } from "@/lib/config";

export class WooError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

const TIMEOUT_MS = 8000;

export interface StoreFetchInit {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  cartToken?: string | null;
  revalidate?: number | false; // seconds, for cacheable public GETs
  tags?: string[];
}

export interface StoreResponse<T> { data: T; cartToken: string | null; headers: Headers }

/**
 * Calls the public WooCommerce Store API from trusted server code only.
 * No consumer key/secret is used anywhere: catalog + cart + checkout are all Store API routes.
 */
export async function storeFetch<T>(path: string, init: StoreFetchInit = {}): Promise<StoreResponse<T>> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.cartToken) headers["Cart-Token"] = init.cartToken;

  const cacheable = method === "GET" && !init.cartToken && init.revalidate !== undefined;
  let res: Response;
  try {
    res = await fetch(`${WORDPRESS_URL}/wp-json/wc/store/v1${path}`, {
      method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(cacheable ? { next: { revalidate: init.revalidate as number | false, tags: init.tags } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new WooError(503, "سرویس فروشگاه در دسترس نیست", "backend_unreachable");
  }

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new WooError(502, "پاسخ نامعتبر از سرویس فروشگاه", "bad_response");
  }
  if (!res.ok) {
    const e = (json ?? {}) as { message?: string; code?: string };
    throw new WooError(res.status, e.message ?? "خطا در ارتباط با فروشگاه", e.code);
  }
  return { data: json as T, cartToken: res.headers.get("Cart-Token"), headers: res.headers };
}

export async function backendHealthy(): Promise<{ ok: boolean; detail?: unknown }> {
  try {
    const r = await fetch(`${WORDPRESS_URL}/wp-json/shomaaa/v1/health`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    return { ok: r.ok, detail: await r.json().catch(() => null) };
  } catch {
    return { ok: false };
  }
}
