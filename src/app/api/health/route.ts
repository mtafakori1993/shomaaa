import { NextResponse } from "next/server";
import { backendHealthy } from "@/lib/woo/client";

export const dynamic = "force-dynamic";

// Liveness: always 200 while the Node process serves requests. `?deep=1` also checks the WooCommerce backend.
export async function GET(req: Request) {
  const deep = new URL(req.url).searchParams.get("deep") === "1";
  if (!deep) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const backend = await backendHealthy();
  return NextResponse.json({ ok: backend.ok, backend: backend.ok ? "up" : "down" }, { status: backend.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
