import { z } from "zod";
import { cartJson, errorResponse, guard, withCart } from "@/lib/server/cart-session";

const schema = z.object({ id: z.number().int().positive(), quantity: z.number().int().min(1).max(20).default(1) });

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    return cartJson(await withCart("/cart/add-item", { method: "POST", body }));
  } catch (e) {
    return errorResponse(e);
  }
}
