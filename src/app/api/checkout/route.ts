import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/checkout-schema";
import { clearCartCookie, errorResponse, getCartToken, guard } from "@/lib/server/cart-session";
import { storeFetch } from "@/lib/woo/client";

interface CheckoutResult { order_id: number; status: string; order_key: string; payment_status: string; payment_result?: { redirect_url?: string } }

export async function POST(req: Request) {
  const g = guard(req, 8);
  if (g) return g;
  try {
    const d = checkoutSchema.parse(await req.json());
    const token = await getCartToken();
    if (!token) return NextResponse.json({ error: "سبد خرید شما خالی است" }, { status: 400 });
    const address = {
      first_name: d.firstName, last_name: d.lastName, address_1: d.address, address_2: "", city: d.city,
      state: d.state, postcode: d.postcode, country: "IR", email: d.email, phone: d.phone,
    };
    const { data } = await storeFetch<CheckoutResult>("/checkout", {
      method: "POST",
      cartToken: token,
      body: {
        billing_address: address,
        shipping_address: { ...address, email: undefined, phone: d.phone },
        customer_note: d.note,
        payment_method: "cod",
        payment_data: [],
      },
    });
    await clearCartCookie();
    // Store API requires the billing e-mail to read an order back; keep it server-side for one hour.
    (await cookies()).set("shm_last_order", JSON.stringify({ id: data.order_id, email: d.email }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1", path: "/", maxAge: 3600 });
    return NextResponse.json({ orderId: data.order_id, orderKey: data.order_key, status: data.status, redirectUrl: data.payment_result?.redirect_url ?? null });
  } catch (e) {
    return errorResponse(e);
  }
}
