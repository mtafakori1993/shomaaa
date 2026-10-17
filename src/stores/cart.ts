"use client";

import { create } from "zustand";
import type { Cart } from "@/lib/woo/types";

interface CartState {
  cart: Cart | null;
  loaded: boolean;
  busy: boolean;
  open: boolean;
  error: string | null;
  setOpen: (v: boolean) => void;
  refresh: () => Promise<void>;
  add: (id: number, quantity?: number) => Promise<boolean>;
  update: (key: string, quantity: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: (code: string) => Promise<void>;
  selectShipping: (packageId: number | string, rateId: string) => Promise<void>;
}

async function call(path: string, method: string, body?: unknown): Promise<{ cart?: Cart; error?: string }> {
  try {
    const res = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: json.error ?? "خطا در ارتباط با فروشگاه" };
    return { cart: json.cart };
  } catch {
    return { error: "اتصال برقرار نشد؛ اینترنت خود را بررسی کنید" };
  }
}

export const useCart = create<CartState>((set) => {
  const run = async (path: string, method: string, body?: unknown) => {
    set({ busy: true, error: null });
    const r = await call(path, method, body);
    if (r.cart) set({ cart: r.cart, busy: false, loaded: true });
    else set({ busy: false, error: r.error ?? null });
    return r;
  };
  return {
    cart: null, loaded: false, busy: false, open: false, error: null,
    setOpen: (open) => set({ open }),
    refresh: async () => { await run("/api/cart", "GET"); },
    add: async (id, quantity = 1) => {
      const r = await run("/api/cart/add", "POST", { id, quantity });
      if (r.cart) set({ open: true });
      return !!r.cart;
    },
    update: async (key, quantity) => { await run("/api/cart/update", "POST", { key, quantity }); },
    remove: async (key) => { await run("/api/cart/remove", "POST", { key }); },
    applyCoupon: async (code) => !!(await run("/api/cart/coupon", "POST", { code })).cart,
    removeCoupon: async (code) => { await run("/api/cart/coupon", "DELETE", { code }); },
    selectShipping: async (packageId, rateId) => { await run("/api/cart/shipping", "POST", { packageId, rateId }); },
  };
});
