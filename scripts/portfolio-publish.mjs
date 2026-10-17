#!/usr/bin/env node
/**
 * Registers SHOMAAA as linked Persian + English "tp_project" entries (نمونه کار / Projects) on tafakorpardazan.ir through the WordPress REST API.
 * Credentials come from the environment (never committed):
 *   PORTFOLIO_USER=… PORTFOLIO_APP_PASSWORD="xxxx xxxx …" node scripts/portfolio-publish.mjs [--publish]
 * Idempotent: media are reused by slug, projects are updated by slug. Default status is `draft`; `--publish` publishes both languages.
 * Language linking uses the site's own POST /tp/v1/translations endpoint ({kind:"post", translations:{fa:ID,en:ID}}).
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
  { src: "artifacts/mockups/portfolio-cover.png", name: "shomaaa-live-cover", alt: { fa: "ماکاپ فروشگاه شوما روی لپ‌تاپ و موبایل", en: "SHOMAAA storefront mockup on laptop and phones" }, w: 1600 },
  { src: "artifacts/screenshots/desktop-home-fold.png", name: "shomaaa-live-home", alt: { fa: "صفحه اصلی فروشگاه شوما در نسخه دسکتاپ", en: "SHOMAAA homepage on desktop" }, w: 1440 },
  { src: "artifacts/screenshots/mens-collection.png", name: "shomaaa-live-collection", alt: { fa: "مجموعه مردانه با فیلتر و مرتب‌سازی", en: "Men's collection with filters and sorting" }, w: 1440 },
  { src: "artifacts/screenshots/product-detail.png", name: "shomaaa-live-product", alt: { fa: "صفحه محصول با انتخاب سایز", en: "Product page with size selection" }, w: 1440 },
  { src: "artifacts/screenshots/checkout.png", name: "shomaaa-live-checkout", alt: { fa: "صفحه تسویه حساب با اعتبارسنجی فرم", en: "Checkout with form validation" }, w: 1440 },
  { src: "artifacts/mockups/mobile-mockup.png", name: "shomaaa-live-mobile", alt: { fa: "نسخه موبایل: صفحه اصلی و صفحه محصول", en: "Mobile: homepage and product page" }, w: 1400 },
  { src: "artifacts/screenshots/brand-hero.png", name: "shomaaa-live-brand", alt: { fa: "تصویر برند شوما با کمپین پاییز و زمستان", en: "SHOMAAA brand hero, autumn/winter campaign" }, w: 1600 },
];

async function uploadImage(img) {
  const found = await api(`/wp/v2/media?search=${img.name}&per_page=20&_fields=id,source_url,slug`);
  const hit = found.find((m) => m.slug === img.name);
  if (hit) return hit;
  const buf = await sharp(path.join(ROOT, img.src)).resize({ width: img.w, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  const media = await api("/wp/v2/media", { method: "POST", headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${img.name}.webp"` }, body: buf });
  await api(`/wp/v2/media/${media.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt_text: img.alt.fa, title: img.alt.fa }) });
  return { id: media.id, source_url: media.source_url };
}

const post = (p, o) => api(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });

// ---- technology terms (per language; term translations are linked through the site's own endpoint)
const TECH = [
  { fa: ["Next.js", 218], en: ["Next.js", 295] }, { fa: ["React", 202], en: ["React", 249] }, { fa: ["TypeScript", 204], en: ["TypeScript", 257] },
  { fa: ["Tailwind CSS", 214], en: ["Tailwind CSS", 289] }, { fa: ["Docker", 210], en: ["Docker", 255] }, { fa: ["Kubernetes", 208], en: ["Kubernetes", 245] },
  { fa: ["WooCommerce"], en: ["WooCommerce"] }, { fa: ["WordPress"], en: ["WordPress"] }, { fa: ["MySQL"], en: ["MySQL"] }, { fa: ["Playwright"], en: ["Playwright"] },
];
async function ensureTerm(lang, name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + (lang === "en" ? "-en" : "");
  const found = await api(`/wp/v2/tp_technology?slug=${slug}&_fields=id,slug`);
  if (found.length) return found[0].id;
  return (await post(`/wp/v2/tp_technology?lang=${lang}`, { name, slug })).id;
}
const techIds = { fa: [], en: [] };
for (const t of TECH) {
  const fa = t.fa[1] ?? (await ensureTerm("fa", t.fa[0]));
  const en = t.en[1] ?? (await ensureTerm("en", t.en[0]));
  techIds.fa.push(fa); techIds.en.push(en);
  if (!t.fa[1]) await post("/tp/v1/translations", { kind: "term", translations: { fa, en } }).catch((e) => console.warn("term link", t.fa[0], e.message));
}

const media = {};
for (const img of images) { media[img.name] = await uploadImage(img); console.log("media", img.name, media[img.name].id); }
const M = (n) => media[n];
const byName = Object.fromEntries(images.map((i) => [i.name, i]));
const fig = (n, lang) => `<figure style="margin:0"><img src="${M(n).source_url}" alt="${byName[n].alt[lang]}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:18px;border:1px solid rgba(246,250,248,.12);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)"/></figure>`;
const btn = (label) => `<!-- wp:html -->
<p style="margin-block:24px"><a href="https://shomaaa.ir" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#c9a46a;color:#111;font-weight:700;text-decoration:none">${label}</a></p>
<!-- /wp:html -->`;
const h = (t) => `<!-- wp:heading -->\n<h2>${t}</h2>\n<!-- /wp:heading -->`;
const p = (t) => `<!-- wp:paragraph -->\n<p>${t}</p>\n<!-- /wp:paragraph -->`;
const ul = (items) => `<!-- wp:list -->\n<ul class="wp-block-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>\n<!-- /wp:list -->`;
const shots = (names, lang) => `<!-- wp:html -->\n<div class="tp-shots" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-block:24px">${names.map((n) => fig(n, lang)).join("")}</div>\n<!-- /wp:html -->`;

const CONTENT = {
  fa: [
    btn("مشاهده فروشگاه زنده: shomaaa.ir"),
    p("شومـا (SHOMAAA) یک تجربه مدرن خرید آنلاین پوشاک رسمی مردانه و زنانه است؛ کت‌وشلوار، بلیزر، پیراهن، پوشاک مجلسی و اکسسوری. تمرکز پروژه بر هویت بصری اختصاصی، رابط فارسی و راست‌چین، نمایش حرفه‌ای محصولات و تجربه خریدی روان در موبایل، تبلت و دسکتاپ بوده است."),
    p("<strong>سفارش خانم یاسمین یمینی</strong> · طراحی و توسعه: تفکر پردازان"),
    shots(["shomaaa-live-cover"], "fa"),
    h("اهداف و نیازمندی‌های کسب‌وکار"),
    ul(["ساخت فروشگاهی متمایز برای بازار ایران که ظاهر آن شبیه قالب‌های آماده نباشد و به یک برند مد اعتماد‌آفرین شبیه باشد", "نگه داشتن مدیریت محصول، موجودی، تخفیف و سفارش در ابزار آشنای ووکامرس", "تجربه کاملاً فارسی و راست‌چین، با اعداد، قیمت‌ها و تایپوگرافی درست", "سرعت مناسب موبایل، سئوی تمیز و قابلیت توسعه بعدی (درگاه پرداخت، حساب کاربری)"]),
    h("مفهوم طراحی و هویت برند"),
    p("نام و نشان برند، پالت و تایپوگرافی از ابتدا طراحی شدند: نشان یک «یقه کت» ساده با دکمه برنزی، نوشتار لاتین SHOMAAA با حروف باز و فونت وزیر برای متن فارسی. پالت بر پایه عاجی گرم، زغالی و برنزی/زیتونی ملایم است و از گرادیان‌های رایج و کارت‌های بیش‌ازحد گرد پرهیز شده است."),
    p("سیستم طراحی با الهام از نظم Adobe Spectrum ساخته شد: شبکه ۴ پیکسلی، مقیاس تایپوگرافی پلکانی، توکن‌های رنگ و حالت‌های تعامل (hover، فوکوس، غیرفعال)، حلقه فوکوس ۲ پیکسلی و فرم‌ها و دیالوگ‌های دسترس‌پذیر. بسته Spectrum نصب نشده است؛ اصول آن به‌صورت دستی و با Radix UI برای اجزای دسترس‌پذیر پیاده شده‌اند."),
    h("تجربه کاربری و طراحی واکنش‌گرا"),
    ul(["منوی ناوبری راست‌چین، منوی موبایل، جست‌وجوی زنده و سبد خرید کشویی", "صفحه مجموعه با فیلتر قیمت، سایز و رنگ، مرتب‌سازی و صفحه‌بندی", "صفحه محصول با گالری، انتخاب سایز/رنگ، اعتبارسنجی انتخاب و وضعیت موجودی", "بدون سرریز افقی از ۳۲۰ تا ۱۹۲۰ پیکسل (با تست خودکار)", "حالت‌های خالی، بارگذاری، خطا و صفحه ۴۰۴ سفارشی"]),
    shots(["shomaaa-live-home", "shomaaa-live-collection", "shomaaa-live-product", "shomaaa-live-checkout"], "fa"),
    shots(["shomaaa-live-mobile"], "fa"),
    h("قابلیت‌های فروشگاهی (پیاده‌سازی و بررسی‌شده)"),
    ul(["۳۰ محصول نمونه با نام و توضیحات فارسی، دسته‌بندی، SKU، موجودی، ویژگی‌ها و داده ساختاریافته؛ مدیریت از پنل ووکامرس", "محصولات متغیر واقعی (سایز و رنگ) با موجودی هر ترکیب و تصویر اختصاصی رنگ‌ها", "جست‌وجو، فیلتر، مرتب‌سازی، سبد خرید ماندگار، تغییر تعداد، حذف و کد تخفیف", "تسویه حساب مهمان با اعتبارسنجی نشانی و موبایل ایرانی و ثبت <strong>سفارش واقعی</strong> در ووکامرس", "ارسال رایگان بالای ۱۵ میلیون تومان و هزینه ثابت ارسال"]),
    h("معماری فنی و فناوری‌ها"),
    p("ویترین با Next.js (App Router)، React و TypeScript سخت‌گیر نوشته شده و فقط از سمت سرور با Store API عمومی ووکامرس ارتباط می‌گیرد؛ هیچ کلید محرمانه‌ای در مرورگر یا مخزن وجود ندارد. توکن سبد خرید در کوکی httpOnly نگهداری می‌شود. پشتیبان فروشگاه WordPress + WooCommerce + MySQL است و برای استقرار از Kubernetes (k3s)، Traefik و گواهی Let’s Encrypt روی زیرساخت تفکر پردازان استفاده شده است. Playwright برای تست انتها‌به‌انتها به‌کار رفته است."),
    h("تولید تصاویر محصول با هوش مصنوعی"),
    p("تصاویر محصولات با مدل Nano Banana 2.1 (از طریق OpenRouter) و با یک اسکریپت قابل‌ازسرگیری، با سقف هزینه و اعتبارسنجی خروجی تولید و به WebP بهینه شدند؛ ۴۲ تصویر روی هم حدود ۱٫۵ دلار هزینه داشت. این تصاویر تصویرسازی هستند و در خود فروشگاه هم «نمونه (تصویرسازی‌شده)» معرفی شده‌اند."),
    h("عملکرد، دسترس‌پذیری، سئو و امنیت"),
    ul(["Lighthouse موبایل (شبیه‌سازی شبکه کند): عملکرد ۸۸ تا ۹۳، دسترس‌پذیری ۹۶ تا ۹۷، بهترین‌روش‌ها ۱۰۰، سئو ۱۰۰؛ CLS برابر صفر", "سئو: عنوان و توضیحات فارسی، canonical، نقشه سایت، robots، داده ساختاریافته محصول و breadcrumb", "امنیت: اعتبارسنجی ورودی با Zod، محدودیت نرخ، بررسی مبدأ درخواست‌ها، هدرهای امنیتی و HSTS، شبکه‌بندی پیش‌فرض‌بسته در کلاستر و عدم دسترسی عمومی به پنل مدیریت", "۵۷ تست خودکار Playwright روی نسخه تولید شامل ثبت سفارش، سبد، فیلترها و واکنش‌گرایی"]),
    h("وضعیت پروژه"),
    p("فروشگاه روی <a href=\"https://shomaaa.ir\" target=\"_blank\" rel=\"noopener\">shomaaa.ir</a> با HTTPS معتبر در دسترس است و به‌صورت <strong>ویترین نمایشی</strong> اجرا می‌شود: محصولات و قیمت‌ها نمونه‌اند و درگاه پرداخت واقعی هنوز متصل نشده است (ثبت سفارش بدون برداشت وجه انجام می‌شود). ورود با حساب کاربری و تاریخچه سفارش در این نسخه وجود ندارد و برنامه‌ریزی‌شده است."),
    h("مشخصات پروژه"),
    ul(["سفارش‌دهنده: خانم یاسمین یمینی", "حوزه: فروشگاه اینترنتی پوشاک و اکسسوری", "بازار هدف: ایران · زبان: فارسی · طراحی: واکنش‌گرا و راست‌چین", "وب‌سایت: <a href=\"https://shomaaa.ir\" target=\"_blank\" rel=\"noopener\">https://shomaaa.ir</a>", "طراحی و توسعه: تفکر پردازان — <a href=\"https://tafakorpardazan.ir\">tafakorpardazan.ir</a>"]),
    btn("مشاهده فروشگاه زنده"),
  ].join("\n\n"),
  en: [
    btn("Visit the live store: shomaaa.ir"),
    p("SHOMAAA is a modern online store for formal menswear and womenswear: tailored suits, blazers, shirts, occasionwear and accessories. The project focuses on a distinctive visual identity, a right-to-left Persian interface, polished product presentation and a smooth shopping flow on mobile, tablet and desktop."),
    p("<strong>Commissioned by Ms. Yasmin Yamini</strong> · Designed and developed by Tafakor Pardazan"),
    shots(["shomaaa-live-cover"], "en"),
    h("Objectives and business requirements"),
    ul(["A storefront for the Iranian market that feels like a fashion brand rather than an off-the-shelf shop template", "Keep product, stock, discount and order management in WooCommerce, a tool the owner already knows", "A fully Persian, right-to-left experience with correct numerals, prices and typography", "Mobile-first speed, clean SEO and room to grow (payment gateway, customer accounts)"]),
    h("Design concept and brand identity"),
    p("The name, mark, palette and typography were designed from scratch: a minimal jacket-lapel symbol with a bronze button, a letter-spaced SHOMAAA wordmark, and Vazir for Persian text. The palette is warm ivory, charcoal and restrained bronze/olive, deliberately avoiding generic gradients and over-rounded cards."),
    p("The design system borrows the discipline of Adobe Spectrum: a 4px spacing grid, a stepped type scale, colour and interaction-state tokens (hover, focus, disabled), a 2px offset focus ring, and accessible forms and dialogs. Spectrum itself is not installed; its principles were applied by hand, with Radix UI primitives for accessible components."),
    h("UI/UX and responsive design"),
    ul(["RTL navigation, a mobile menu, live search and a slide-over cart", "Collection pages with price, size and colour filters, sorting and pagination", "Product pages with a gallery, size/colour selection, validation and stock status", "No horizontal overflow from 320px to 1920px (verified by automated tests)", "Designed empty, loading and error states plus a custom 404"]),
    shots(["shomaaa-live-home", "shomaaa-live-collection", "shomaaa-live-product", "shomaaa-live-checkout"], "en"),
    shots(["shomaaa-live-mobile"], "en"),
    h("E-commerce functionality (implemented and verified)"),
    ul(["30 sample products with Persian names and copy, categories, SKUs, stock, attributes and structured data, managed from the WooCommerce admin", "Real variable products (size and colour) with per-combination stock and colour-specific images", "Search, filtering, sorting, a persistent cart, quantity changes, removal and discount codes", "Guest checkout with Iranian address and mobile validation that creates a <strong>real WooCommerce order</strong>", "Free shipping above 15 million toman and a flat shipping rate"]),
    h("Technical architecture and technologies"),
    p("The storefront is built with Next.js (App Router), React and strict TypeScript, and talks to WooCommerce only from the server through the public Store API: no secret key exists in the browser or the repository, and the cart token lives in an httpOnly cookie. The back end is WordPress + WooCommerce + MySQL. It is deployed manually on Kubernetes (k3s) behind Traefik with Let’s Encrypt certificates on Tafakor Pardazan’s infrastructure. End-to-end testing uses Playwright."),
    h("AI product photography workflow"),
    p("Product images were generated with Nano Banana 2.1 through OpenRouter using a resumable script with a cost cap and output validation, then optimised to WebP. The 42 images cost about US$1.5 in total. They are illustrations, not photographs of physical stock, and the storefront labels them as such."),
    h("Performance, accessibility, SEO and security"),
    ul(["Lighthouse mobile (simulated slow network): performance 88–93, accessibility 96–97, best practices 100, SEO 100; CLS 0", "SEO: Persian titles and descriptions, canonical URLs, sitemap, robots, product and breadcrumb structured data", "Security: Zod input validation, rate limiting, same-origin checks, security headers with HSTS, default-deny network policies and no public admin panel", "57 automated Playwright tests against the production build cover checkout, cart, filters and responsiveness"]),
    h("Project status"),
    p("The store is live at <a href=\"https://shomaaa.ir\" target=\"_blank\" rel=\"noopener\">shomaaa.ir</a> over valid HTTPS and currently runs as a <strong>demo storefront</strong>: products and prices are samples and no real payment gateway is connected yet (orders are recorded without charging anyone). Customer login and order history are not part of this release and are planned."),
    h("Project details"),
    ul(["Commissioned by: Ms. Yasmin Yamini", "Industry: Fashion and e-commerce", "Target market: Iran · Storefront language: Persian · Design: responsive, right-to-left", "Website: <a href=\"https://shomaaa.ir\" target=\"_blank\" rel=\"noopener\">https://shomaaa.ir</a>", "Designed and developed by Tafakor Pardazan — <a href=\"https://tafakorpardazan.ir/en/home/\">tafakorpardazan.ir</a>"]),
    btn("Visit the live store"),
  ].join("\n\n"),
};

const META = {
  fa: { title: "شومـا (SHOMAAA)؛ فروشگاه آنلاین پوشاک رسمی و اکسسوری", slug: "shomaaa", cat: [190], excerpt: "فروشگاه آنلاین پوشاک رسمی مردانه و زنانه با هویت بصری اختصاصی، رابط فارسی و راست‌چین و تجربه خرید واکنش‌گرا؛ سفارش خانم یاسمین یمینی." },
  en: { title: "SHOMAAA — Premium Men's and Women's Fashion E-commerce", slug: "shomaaa-fashion-ecommerce", cat: [228], excerpt: "A modern fashion store for men's and women's formalwear with a distinctive identity, a right-to-left Persian interface and a responsive shopping flow. Commissioned by Ms. Yasmin Yamini." },
};

const ids = {};
for (const lang of ["fa", "en"]) {
  const m = META[lang];
  const body = { title: m.title, slug: m.slug, status: STATUS, excerpt: m.excerpt, content: CONTENT[lang], featured_media: M("shomaaa-live-home").id, tp_project_category: m.cat, tp_technology: techIds[lang] };
  const existing = await api(`/wp/v2/tp_project?slug=${m.slug}&status=any&context=edit&_fields=id`);
  const res = existing.length ? await post(`/wp/v2/tp_project/${existing[0].id}`, body) : await post(`/wp/v2/tp_project?lang=${lang}`, body); // Polylang takes the language of NEW posts from ?lang=
  ids[lang] = res.id;
  const full = await api(`/wp/v2/tp_project/${res.id}?context=edit&_fields=id,status,permalink_template`);
  console.log(lang, JSON.stringify(full));
}
await post("/tp/v1/translations", { kind: "post", translations: ids });
for (const lang of ["fa", "en"]) console.log("final", lang, JSON.stringify(await api(`/wp/v2/tp_project/${ids[lang]}?context=edit&_fields=id,status,link,permalink_template`)));
