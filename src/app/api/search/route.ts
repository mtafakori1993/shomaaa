import { NextResponse } from "next/server";
import { listProducts } from "@/lib/woo/catalog";
import { errorResponse, guard } from "@/lib/server/cart-session";

export async function GET(req: Request) {
  const g = guard(req, 60);
  if (g) return g;
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 60) ?? "";
  if (q.length < 2) return NextResponse.json({ products: [] });
  try {
    const { products } = await listProducts({ search: q, perPage: 6 });
    return NextResponse.json({ products });
  } catch (e) {
    return errorResponse(e);
  }
}
