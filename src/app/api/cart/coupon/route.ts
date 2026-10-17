import { z } from "zod";
import { cartJson, errorResponse, guard, withCart } from "@/lib/server/cart-session";

const schema = z.object({ code: z.string().trim().min(2).max(40).regex(/^[\w-]+$/i, "کد تخفیف معتبر نیست") });

export async function POST(req: Request) {
  const g = guard(req, 20);
  if (g) return g;
  try {
    const { code } = schema.parse(await req.json());
    return cartJson(await withCart("/cart/apply-coupon", { method: "POST", body: { code } }));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  const g = guard(req, 20);
  if (g) return g;
  try {
    const { code } = schema.parse(await req.json());
    return cartJson(await withCart("/cart/remove-coupon", { method: "POST", body: { code } }));
  } catch (e) {
    return errorResponse(e);
  }
}
