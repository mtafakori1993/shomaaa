#!/usr/bin/env node
// Captures real screenshots of the running storefront and builds presentation mockups from them.
//   BASE_URL=http://localhost:3100 node scripts/capture.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const SHOTS = path.join(ROOT, "artifacts/screenshots");
const MOCK = path.join(ROOT, "artifacts/mockups");
fs.mkdirSync(SHOTS, { recursive: true }); fs.mkdirSync(MOCK, { recursive: true });

const browser = await chromium.launch();
const settle = async (p) => {
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
};

const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "fa-IR", deviceScaleFactor: 1 });
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "fa-IR" });

const d = await desk.newPage();
const go = async (p, url) => { for (let i = 0; ; i++) { try { await p.goto(BASE + url, { waitUntil: "load", timeout: 60000 }); break; } catch (e) { if (i >= 3) throw e; } } await settle(p); };
await go(d, "/"); await d.screenshot({ path: `${SHOTS}/desktop-home.png`, fullPage: true });
await d.screenshot({ path: `${SHOTS}/desktop-home-fold.png` });
await go(d, "/collections/men"); await d.screenshot({ path: `${SHOTS}/mens-collection.png` });
await go(d, "/collections/women"); await d.screenshot({ path: `${SHOTS}/womens-collection.png` });
await go(d, "/products/aria-charcoal-wool-suit");
await d.getByRole("radio", { name: "۵۰" }).click();
await d.screenshot({ path: `${SHOTS}/product-detail.png` });
await d.getByTestId("add-to-cart").click();
await d.getByTestId("cart-drawer").waitFor();
await d.screenshot({ path: `${SHOTS}/cart-drawer.png` });
await go(d, "/products/silk-bow-tie-black"); await d.getByTestId("add-to-cart").click(); await d.getByTestId("cart-drawer").waitFor();
await go(d, "/cart"); await d.getByTestId("cart-line").first().waitFor(); await d.screenshot({ path: `${SHOTS}/cart.png` });
await go(d, "/checkout"); await d.getByTestId("place-order").waitFor();
await d.fill('[name="firstName"]', "نمونه"); await d.fill('[name="lastName"]', "آزمایشی");
await d.getByTestId("place-order").click(); // shows validation states of the real form
await d.waitForTimeout(400);
await d.screenshot({ path: `${SHOTS}/checkout.png` });

const m = await mob.newPage();
await go(m, "/"); await m.screenshot({ path: `${SHOTS}/mobile-home.png` });
await m.screenshot({ path: `${SHOTS}/mobile-home-full.png`, fullPage: true });
await go(m, "/collections/men"); await m.screenshot({ path: `${SHOTS}/mobile-collection.png` });
await go(m, "/products/aria-charcoal-wool-suit"); await m.screenshot({ path: `${SHOTS}/mobile-product.png` });

// Editorial brand hero: the campaign image from the homepage hero, 16:9 crop with the real headline
const hero = fs.readFileSync(path.join(ROOT, "public/media/editorial/hero.webp")).toString("base64");
const vz = fs.readFileSync(path.join(ROOT, "src/fonts/Vazir-Bold.woff2")).toString("base64");
const cg = fs.readFileSync(path.join(ROOT, "src/fonts/cormorant-garamond-latin-500-normal.woff2")).toString("base64");
const css = `@font-face{font-family:V;src:url(data:font/woff2;base64,${vz}) format('woff2');font-weight:700}@font-face{font-family:C;src:url(data:font/woff2;base64,${cg}) format('woff2')}*{box-sizing:border-box}body{margin:0}`;
const tool = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await tool.setContent(`<style>${css}.h{width:1920px;height:1080px;position:relative;background:#1b1917 url(data:image/webp;base64,${hero}) center 22%/cover;direction:rtl;font-family:V;color:#f6f1e9}.h:before{content:"";position:absolute;inset:0;background:linear-gradient(270deg,rgba(21,19,17,.88) 0%,rgba(21,19,17,.55) 38%,rgba(21,19,17,0) 70%)}.t{position:absolute;right:140px;top:50%;transform:translateY(-50%);width:720px}.k{font-family:C;letter-spacing:.45em;color:#cdb38a;font-size:26px;direction:ltr;text-align:right}.t h1{font-size:92px;line-height:1.45;margin:18px 0 28px}.t h1 em{font-style:normal;color:#cdb38a}.s{font-family:C;font-size:54px;letter-spacing:.32em;direction:ltr;text-align:right}</style><div class="h"><div class="t"><div class="k">AUTUMN / WINTER</div><h1>دوخت دقیق،<br>حضوری که <em>به یاد می‌ماند</em></h1><div class="s">SHOMAAA</div></div></div>`);
await tool.evaluate(() => document.fonts.ready);
await tool.screenshot({ path: `${SHOTS}/brand-hero.png` });

// Mockups built from the real screenshots
const b64 = (f) => fs.readFileSync(f).toString("base64");
const dsk = b64(`${SHOTS}/desktop-home-fold.png`), mhome = b64(`${SHOTS}/mobile-home.png`), mprod = b64(`${SHOTS}/mobile-product.png`), pdp = b64(`${SHOTS}/product-detail.png`);
const frameCss = `${css}.laptop{position:absolute;width:1060px;left:140px;top:150px}.lid{background:#0f0f0f;border-radius:22px 22px 4px 4px;padding:16px 16px 20px;box-shadow:0 40px 80px rgba(0,0,0,.35)}.lid img{width:100%;display:block;border-radius:6px}.base{height:20px;margin:0 -60px;background:linear-gradient(#d9d6cf,#aaa69d);border-radius:0 0 40px 40px}.phone{position:absolute;width:300px;background:#0f0f0f;border-radius:46px;padding:11px;box-shadow:0 40px 70px rgba(0,0,0,.4)}.phone img{width:100%;display:block;border-radius:36px}`;
const cover = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
await cover.setContent(`<style>${frameCss}.bg{width:1920px;height:1200px;position:relative;overflow:hidden;background:radial-gradient(120% 100% at 20% 0%,#f6f1e9 0%,#e6dccb 60%,#d4c6ae 100%);font-family:V;direction:rtl}.cap{position:absolute;right:120px;top:90px;color:#1b1917}.cap .k{font-family:C;letter-spacing:.4em;color:#85653c;font-size:22px;direction:ltr;text-align:right}.cap h2{font-size:54px;margin:10px 0 0}.cap p{font-size:24px;color:#5b554d;margin:8px 0 0;font-family:V;font-weight:400}.ph1{left:1230px;top:330px;transform:rotate(-4deg)}.ph2{left:1420px;top:410px;transform:rotate(3deg)}</style><div class="bg"><div class="cap"><div class="k">E-COMMERCE · SHOMAAA.IR</div><h2>فروشگاه آنلاین پوشاک رسمی شوما</h2><p>طراحی و توسعه: تفکر پردازان</p></div><div class="laptop" style="left:90px;top:270px;width:1180px"><div class="lid"><img src="data:image/png;base64,${dsk}"></div><div class="base"></div></div><div class="phone ph1"><img src="data:image/png;base64,${mhome}"></div><div class="phone ph2"><img src="data:image/png;base64,${mprod}"></div></div>`);
await cover.evaluate(() => document.fonts.ready);
await cover.screenshot({ path: `${MOCK}/portfolio-cover.png` });
const dm = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await dm.setContent(`<style>${frameCss}.bg{width:1600px;height:1000px;position:relative;background:#e9e1d3}</style><div class="bg"><div class="laptop" style="left:200px;top:110px;width:1200px"><div class="lid"><img src="data:image/png;base64,${pdp}"></div><div class="base"></div></div></div>`);
await dm.screenshot({ path: `${MOCK}/desktop-mockup.png` });
const mm = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await mm.setContent(`<style>${frameCss}.bg{width:1400px;height:1000px;position:relative;background:#e9e1d3}</style><div class="bg"><div class="phone" style="left:300px;top:90px;width:340px"><img src="data:image/png;base64,${mhome}"></div><div class="phone" style="left:760px;top:130px;width:340px"><img src="data:image/png;base64,${mprod}"></div></div>`);
await mm.screenshot({ path: `${MOCK}/mobile-mockup.png` });
await browser.close();
console.log("captured");
