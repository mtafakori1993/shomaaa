import { expect, test } from "@playwright/test";

for (const w of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test(`no horizontal overflow at ${w}px on key pages`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    for (const path of ["/", "/collections/women", "/products/aria-charcoal-wool-suit", "/cart", "/faq"]) {
      await page.goto(path);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${path} @${w}`).toBeLessThanOrEqual(0);
    }
  });
}

test("mobile menu opens, lists categories and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "باز کردن منو" }).click();
  await page.getByRole("link", { name: "زنانه", exact: true }).click();
  await expect(page).toHaveURL(/collections\/women$/);
});
