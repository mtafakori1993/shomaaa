#!/usr/bin/env node
// Generates logo variations, favicon/app icons and the social sharing image from first principles.
// Fonts are embedded from the bundled files; rendering uses Playwright (Chromium).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const b64 = (f) => fs.readFileSync(path.join(ROOT, "src/fonts", f)).toString("base64");
const corm = b64("cormorant-garamond-latin-500-normal.woff2");
const vazir = b64("Vazir-Bold.woff2");
const vazirReg = b64("Vazir.woff2");
const ACCENT = "#a07c4c";

const symbol = (c) => `<g fill="none"><path d="M9 4h22a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="${c}" stroke-width="1.6"/><path d="M13 4l7 17 7-17" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="28" r="2" fill="${ACCENT}"/></g>`;
const fontCss = `@font-face{font-family:C;src:url(data:font/woff2;base64,${corm}) format('woff2');font-weight:500}@font-face{font-family:V;src:url(data:font/woff2;base64,${vazir}) format('woff2');font-weight:700}`;

const wordmarkSvg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 64" width="360" height="64" role="img" aria-label="SHOMAAA — شوما"><title>SHOMAAA — شوما</title><style>${fontCss}</style><g transform="translate(0 6) scale(1.3)">${symbol(c)}</g><text x="72" y="36" font-family="C,Georgia,serif" font-weight="500" font-size="34" letter-spacing="9" fill="${c}">SHOMAAA</text><text x="74" y="56" font-family="V,Tahoma,sans-serif" font-weight="700" font-size="12" fill="${ACCENT}">شوما · پوشاک رسمی</text></svg>`;

fs.writeFileSync(path.join(ROOT, "public/brand/logo-light-bg.svg"), wordmarkSvg("#1b1917")); // for light backgrounds
fs.writeFileSync(path.join(ROOT, "public/brand/logo-dark-bg.svg"), wordmarkSvg("#f6f1e9")); // for dark backgrounds
fs.writeFileSync(path.join(ROOT, "public/brand/symbol-light-bg.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="160" height="160">${symbol("#1b1917")}</svg>`);
fs.writeFileSync(path.join(ROOT, "public/brand/symbol-dark-bg.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="160" height="160">${symbol("#f6f1e9")}</svg>`);
// App icon: symbol on an ivory tile (no text, so it needs no font)
fs.writeFileSync(path.join(ROOT, "src/app/icon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1b1917"/><g transform="translate(4 4)">${symbol("#f6f1e9")}</g></svg>`);

const heroB64 = fs.readFileSync(path.join(ROOT, "public/media/editorial/hero.webp")).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage();
const shot = async (html, w, h, out) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
};
await shot(`<body style="margin:0;background:#1b1917;display:grid;place-items:center;width:512px;height:512px"><svg viewBox="0 0 40 40" width="360">${symbol("#f6f1e9")}</svg></body>`, 512, 512, path.join(ROOT, "public/brand/icon-512.png"));
fs.copyFileSync(path.join(ROOT, "public/brand/icon-512.png"), path.join(ROOT, "src/app/apple-icon.png"));
const og = `<style>${fontCss}@font-face{font-family:VR;src:url(data:font/woff2;base64,${vazirReg}) format('woff2');font-weight:400}body{margin:0;width:1200px;height:630px;background:#f6f1e9;display:flex;direction:ltr;overflow:hidden;font-family:V}
.l{flex:1;padding:72px;display:flex;flex-direction:column;justify-content:center;gap:22px;direction:rtl}
h1{margin:0;font-size:54px;line-height:1.4;color:#1b1917}h1 em{color:#85653c;font-style:normal}p{margin:0;font-size:26px;font-family:VR;color:#5b554d;line-height:1.9}
.w{font-family:C;font-size:34px;letter-spacing:.3em;color:#1b1917;direction:ltr;display:flex;align-items:center;gap:16px}.r{width:480px;background:url(data:image/webp;base64,${heroB64}) center top/cover}</style>
<body><div class="r"></div><div class="l"><div class="w"><svg viewBox="0 0 40 40" width="46">${symbol("#1b1917")}</svg>SHOMAAA</div><h1>دوخت دقیق،<br>حضوری که <em>به یاد می‌ماند</em></h1><p>پوشاک رسمی مردانه و زنانه · shomaaa.ir</p></div></body>`;
await shot(og, 1200, 630, path.join(ROOT, "src/app/opengraph-image.png"));
await browser.close();
console.log("brand assets written");
