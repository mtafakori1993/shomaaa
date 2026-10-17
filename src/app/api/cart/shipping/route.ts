import { z } from "zod";
import { cartJson, errorResponse, guard, withCart } from "@/lib/server/cart-session";

const schema = z.object({ packageId: z.union([z.number(), z.string()]), rateId: z.string().regex(/^[\w:.-]+$/) });

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const { packageId, rateId } = schema.parse(await req.json());
    return cartJson(await withCart("/cart/select-shipping-rate", { method: "POST", body: { package_id: packageId, rate_id: rateId } }));
  } catch (e) {
    return errorResponse(e);
  }
}
