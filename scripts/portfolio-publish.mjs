#!/usr/bin/env node
/**
 * Registers SHOMAAA as a "tp_project" (نمونه کار) on tafakorpardazan.ir through the WordPress REST API.
 * Credentials come from the environment (never committed):
 *   PORTFOLIO_USER=… PORTFOLIO_APP_PASSWORD="xxxx xxxx …" node scripts/portfolio-publish.mjs [--publish]
 * Idempotent: media are reused by filename, the project is updated by slug. Default status is `draft`.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = process.env.PORTFOLIO_SITE ?? "https://tafakorpardazan.ir";
const AUTH = "Basic " + Buffer.from(`${process.env.PORTFOLIO_USER}:${process.env.PORTFOLIO_APP_PASSWORD}`).toString("base64");
const STATUS = process.argv.includes("--publish") ? "publish" : "draft";
if (!process.env.PORTFOLIO_USER || !process.env.PORTFOLIO_APP_PASSWORD) { console.error("PORTFOLIO_USER / PORTFOLIO_APP_PASSWORD required"); process.exit(1); }

async function api(p, init = {}, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(`${SITE}/wp-json${p}`, { ...init, headers: { Authorization: AUTH, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(120_000) });
      const text = await r.text();
      const json = text ? JSON.parse(text.slice(text.indexOf(text.trimStart()[0] === "[" ? "[" : "{"))) : null;
      if (!r.ok) throw Object.assign(new Error(`${r.status} ${json?.message ?? ""}`), { status: r.status });
      return json;
    } catch (e) { last = e; if (e.status && e.status < 500) break; await new Promise((r) => setTimeout(r, 2000 * i)); }
  }
  throw last;
}

const images = [
  { src: "artifacts/mockups/portfolio-cover.png", name: "shomaaa-cover", alt: "ماکاپ وب‌سایت فروشگاه شوما روی لپ‌تاپ و موبایل", w: 1600 },
  { src: "artifacts/screenshots/desktop-home-fold.png", name: "shomaaa-shot-1", alt: "صفحه اصلی فروشگاه شوما در نسخه دسکتاپ", w: 1440 },
  { src: "artifacts/screenshots/mens-collection.png", name: "shomaaa-shot-2", alt: "صفحه مجموعه مردانه با فیلتر و مرتب‌سازی", w: 1440 },
  { src: "artifacts/screenshots/product-detail.png", name: "shomaaa-shot-3", alt: "صفحه محصول با انتخاب سایز و رنگ", w: 1440 },
  { src: "artifacts/mockups/mobile-mockup.png", name: "shomaaa-shot-4", alt: "نسخه موبایل فروشگاه شوما: صفحه اصلی و صفحه محصول", w: 1400 },
];

async function uploadImage(img) {
  const filename = `${img.name}.webp`;
  const found = await api(`/wp/v2/media?search=${img.name}&per_page=20&_fields=id,source_url,slug`);
  const hit = found.find((m) => m.slug === img.name);
  if (hit) return hit;
  const buf = await sharp(path.join(ROOT, img.src)).resize({ width: img.w, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  const media = await api("/wp/v2/media", { method: "POST", headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${filename}"` }, body: buf });
  await api(`/wp/v2/media/${media.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt_text: img.alt, title: img.alt }) });
  return { id: media.id, source_url: media.source_url };
}

async function ensureTech(name, slug) {
  const found = await api(`/wp/v2/tp_technology?search=${encodeURIComponent(name)}&per_page=50&_fields=id,name,slug`);
  const hit = found.find((t) => t.name === name && !t.slug.endsWith("-en"));
  if (hit) return hit.id;
  const created = await api("/wp/v2/tp_technology", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) });
  return created.id;
}

const media = [];
for (const img of images) { const m = await uploadImage(img); media.push(m); console.log("media", img.name, m.id); }
const [cover, s1, s2, s3, s4] = media;

// Existing Persian technology terms: Next.js 218, React 202, TypeScript 204, Tailwind CSS 214, Docker 210, Kubernetes 208
const techIds = [218, 202, 204, 214, 210, 208];
for (const [n, s] of [["WooCommerce", "woocommerce"], ["WordPress", "wordpress"], ["MySQL", "mysql"], ["Playwright", "playwright"]]) techIds.push(await ensureTech(n, s));

const fig = (m, alt) => `<figure style="margin:0"><img src="${m.source_url}" alt="${alt}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:18px;border:1px solid rgba(246,250,248,.12);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)"/></figure>`;
const content = `<!-- wp:paragraph -->
<p>شوما یک فروشگاه آنلاین راست‌به‌چپ برای پوشاک رسمی مردانه و زنانه است: کت‌وشلوار، بلیزر، پیراهن، پوشاک مجلسی و اکسسوری. این پروژه با سفارش خانم یاسمین یمینی و با تمرکز بر تجربه خرید فارسی‌زبان، سرعت و سادگی مدیریت محصولات ساخته شد.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>سفارش خانم یاسمین یمینی</strong> · نشانی پروژه: <a href="https://shomaaa.ir" rel="noopener">shomaaa.ir</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>مسئله</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>قالب‌های آماده فروشگاهی ظاهری شبیه هم دارند و برای برندی که می‌خواهد حس یک مجله مد و اعتماد یک فروشگاه حرفه‌ای را هم‌زمان منتقل کند کافی نیستند. هدف، فروشگاهی بود که ظاهر برند را حفظ کند و در عین حال مدیریت محصول، موجودی و سفارش در ابزار آشنای ووکامرس بماند.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>راه‌حل</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><li>هویت بصری اختصاصی: نشان، حروف‌نگاری فارسی با فونت وزیر و پالت عاجی، زغالی و برنزی</li><li>معماری هدلس: ویترین Next.js و پشتیبان ووکامرس؛ ارتباط فقط با Store API عمومی و بدون کلید محرمانه در مرورگر</li><li>۳۰ محصول نمونه با سایز و رنگ واقعی (وریشن)، موجودی، تخفیف، توضیحات فارسی و داده ساختاریافته سئو</li><li>جست‌وجو، فیلتر قیمت و سایز و رنگ، مرتب‌سازی، سبد خرید پایدار، کد تخفیف و ثبت سفارش مهمان</li><li>طراحی واکنش‌گرا از ۳۲۰ پیکسل تا دسکتاپ بزرگ و رعایت اصول دسترس‌پذیری</li><li>تصاویر محصول با هوش مصنوعی تصویرسازی شده‌اند و در سایت هم به‌عنوان نمونه معرفی شده‌اند</li><li>استقرار دستی روی کوبرنتیز با Traefik و گواهی TLS، پشتیبان‌گیری شبانه از پایگاه‌داده و مجموعه تست انتها‌به‌انتها با Playwright</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>وضعیت</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>نسخه فعلی یک ویترین نمایشی است: محصولات و قیمت‌ها نمونه‌اند و درگاه پرداخت واقعی هنوز متصل نشده است؛ اتصال درگاه پس از دریافت اطلاعات پذیرنده انجام می‌شود.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>تصاویر پروژه</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div class="tp-shots" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-block:24px">${fig(s1, "صفحه اصلی فروشگاه شوما در نسخه دسکتاپ")}${fig(s2, "صفحه مجموعه مردانه با فیلتر و مرتب‌سازی")}${fig(s3, "صفحه محصول با انتخاب سایز و رنگ")}${fig(s4, "نسخه موبایل فروشگاه شوما")}</div>
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>طراحی و توسعه توسط تفکر پردازان.</p>
<!-- /wp:paragraph -->`;

const body = {
  title: "شوما؛ فروشگاه آنلاین پوشاک رسمی مردانه و زنانه",
  slug: "shomaaa",
  status: STATUS,
  excerpt: "فروشگاه آنلاین پوشاک رسمی مردانه و زنانه با ووکامرس هدلس و Next.js؛ سفارش خانم یاسمین یمینی.",
  content,
  featured_media: cover.id,
  tp_project_category: [190],
  tp_technology: techIds,
};
const existing = await api("/wp/v2/tp_project?slug=shomaaa&status=any&context=edit&_fields=id,link,status");
const res = existing.length
  ? await api(`/wp/v2/tp_project/${existing[0].id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  : await api("/wp/v2/tp_project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
console.log(JSON.stringify({ id: res.id, status: res.status, link: res.link }));
