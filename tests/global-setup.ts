import { execSync } from "node:child_process";

// E2E checkouts create real WooCommerce orders (decrementing stock). Restock the test product on the
// LOCAL docker backend before each run. Never runs against a remote backend.
export default async function globalSetup() {
  if (process.env.SKIP_RESTOCK === "1") return;
  try {
    execSync(
      `docker compose exec -T wordpress wp --allow-root --path=/var/www/html eval '$id=wc_get_product_id_by_sku("SHM-AC-024"); wc_update_product_stock(wc_get_product($id), 500, "set");'`,
      { stdio: "pipe", timeout: 60_000 },
    );
  } catch (e) {
    console.warn("[global-setup] could not restock local backend:", (e as Error).message.split("\n")[0]);
  }
  // Drop cached catalog data so the restock is visible immediately.
  const secret = process.env.REVALIDATE_SECRET ?? "local-dev-revalidate-secret-0123456789";
  await fetch(`${process.env.BASE_URL ?? "http://localhost:3000"}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret } }).catch(() => undefined);
}
