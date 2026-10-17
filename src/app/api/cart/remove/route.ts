import { z } from "zod";
import { cartJson, errorResponse, guard, withCart } from "@/lib/server/cart-session";

const schema = z.object({ key: z.string().regex(/^[a-f0-9]{32}$/) });

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    return cartJson(await withCart("/cart/remove-item", { method: "POST", body }));
  } catch (e) {
    return errorResponse(e);
  }
}
