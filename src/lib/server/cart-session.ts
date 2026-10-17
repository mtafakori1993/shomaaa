import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { storeFetch, WooError, type StoreFetchInit } from "@/lib/woo/client";
import { mapCart } from "@/lib/woo/mappers";
import { clientIp, rateLimit } from "./rate-limit";

const COOKIE = "shm_cart";

/** Runs a Store API call bound to the visitor's Cart-Token (kept in an httpOnly cookie) and returns the mapped cart. */
export async function withCart(path: string, init: StoreFetchInit = {}) {
  const jar = await cookies();
  let token = jar.get(COOKIE)?.value ?? null;
  // Mutations need an existing session: bootstrap a Cart-Token with a read first (Store API demands a nonce otherwise).
  if (!token && (init.method ?? "GET") !== "GET") token = (await storeFetch<unknown>("/cart")).cartToken;
  const { data, cartToken } = await storeFetch<unknown>(path, { ...init, cartToken: token });
  const latest = cartToken ?? token;
  // Reads never create a session cookie: otherwise concurrent page-load reads would race the first add-to-cart.
  if ((init.method ?? "GET") !== "GET" && latest && latest !== jar.get(COOKIE)?.value) {
    jar.set(COOKIE, latest, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1", path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
  return data;
}

export const getCartToken = async () => (await cookies()).get(COOKIE)?.value ?? null;
export const clearCartCookie = async () => (await cookies()).delete(COOKIE);

export function errorResponse(e: unknown) {
  if (e instanceof z.ZodError) return NextResponse.json({ error: "اطلاعات واردشده معتبر نیست", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
  if (e instanceof WooError) {
    const status = e.status >= 500 ? 503 : e.status;
    return NextResponse.json({ error: translateWooMessage(e.message, e.code), code: e.code }, { status });
  }
  return NextResponse.json({ error: "خطای غیرمنتظره؛ لطفاً دوباره تلاش کنید" }, { status: 500 });
}

// WooCommerce usually answers in Persian (fa_IR pack); keep a safe fallback for known codes.
function translateWooMessage(message: string, code?: string) {
  const map: Record<string, string> = {
    woocommerce_rest_product_partially_out_of_stock: "موجودی این محصول کافی نیست",
    woocommerce_rest_product_out_of_stock: "این محصول ناموجود است",
    woocommerce_rest_cart_coupon_error: "کد تخفیف معتبر نیست",
  };
  return (code && map[code]) || message;
}

export function guard(req: Request, limit = 40) {
  if (!rateLimit(`${new URL(req.url).pathname}:${clientIp(req)}`, limit)) {
    return NextResponse.json({ error: "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید" }, { status: 429 });
  }
  // CSRF: state-changing calls must come from our own origin
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 403 });
  }
  return null;
}

export const cartJson = (raw: unknown) => NextResponse.json({ cart: mapCart(raw) }, { headers: { "Cache-Control": "no-store" } });
