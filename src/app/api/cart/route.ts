import { cartJson, errorResponse, guard, withCart } from "@/lib/server/cart-session";

export async function GET(req: Request) {
  const g = guard(req, 120);
  if (g) return g;
  try {
    return cartJson(await withCart("/cart"));
  } catch (e) {
    return errorResponse(e);
  }
}
