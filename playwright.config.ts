import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  timeout: 60_000,
  retries: 1,
  workers: 2,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure", locale: "fa-IR", timezoneId: "Asia/Tehran" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"], viewport: { width: 375, height: 800 } }, testMatch: /responsive|storefront/ },
  ],
});
