import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

const WP = process.env.WORDPRESS_URL ?? "http://localhost:8089";
const count = async (request: import("@playwright/test").APIRequestContext) => {
  const r = await request.get(`${WP}/wp-json/wc/store/v1/products?per_page=1`);
  return Number(r.headers()["x-wp-total"]);
};

test("backend has exactly 30 products; re-running the seed creates no duplicates", async ({ request }) => {
  expect(await count(request)).toBe(30);
  if (process.env.RUN_SEED === "1") {
    const out = execSync("docker compose exec -T wordpress /opt/shomaaa/bootstrap.sh", { encoding: "utf8", timeout: 300_000 });
    expect(out).toContain("created=0 updated=30");
    expect(await count(request)).toBe(30);
  }
});
