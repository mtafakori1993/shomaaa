import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, guard } from "@/lib/server/cart-session";

const schema = z.object({ email: z.string().trim().toLowerCase().email("ایمیل معتبر وارد کنید").max(120) });
const FILE = path.join(process.env.NEWSLETTER_DIR ?? path.join(process.cwd(), ".data"), "newsletter.jsonl");

// Honest implementation: subscriptions are stored server-side (JSON lines on the persistent volume).
// No email is sent automatically; the shop owner exports the list.
export async function POST(req: Request) {
  const g = guard(req, 5);
  if (g) return g;
  try {
    const { email } = schema.parse(await req.json());
    await mkdir(path.dirname(FILE), { recursive: true });
    await appendFile(FILE, JSON.stringify({ email, at: new Date().toISOString() }) + "\n");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
