import "server-only";

// Small in-process token bucket per key. Adequate for one or two replicas; documented in docs/DEPLOYMENT.md.
const buckets = new Map<string, { tokens: number; ts: number }>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  if (process.env.DISABLE_RATE_LIMIT === "1") return true; // automated test runs only
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: limit, ts: now };
  b.tokens = Math.min(limit, b.tokens + ((now - b.ts) / windowMs) * limit);
  b.ts = now;
  if (b.tokens < 1) { buckets.set(key, b); return false; }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (now - v.ts > windowMs * 2) buckets.delete(k);
  return true;
}

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
