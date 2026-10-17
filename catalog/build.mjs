// Builds catalog/products.json (consumed by the WordPress seeder) from products.mjs.
import fs from "node:fs";
import { products } from "./products.mjs";
import categories from "./categories.json" with { type: "json" };

const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

const intro = {
  "men-suits": (p) => `${p.name} با برشی ${p.fit} و پارچه‌ای از جنس ${p.material} دوخته شده است. خط شانه ساختاریافته، یقه‌ای متعادل و شلواری با افتادگی تمیز، ظاهری آراسته و قابل‌اعتماد برای جلسه، مراسم و مهمانی رسمی می‌سازد.`,
  "men-separates": (p) => `${p.name} از جنس ${p.material} و با برش ${p.fit} تهیه شده است؛ قطعه‌ای کاربردی که هم‌زمان با کت‌وشلوار و به‌تنهایی ست می‌شود و گنجینه لباس رسمی شما را کامل می‌کند.`,
  "women-suits": (p) => `${p.name} با برش ${p.fit} و پارچه ${p.material} طراحی شده است. خطوط ساده و تناسب دقیق، حضوری مطمئن و مدرن در محل کار و مجالس رسمی ایجاد می‌کند.`,
  "women-formal": (p) => `${p.name} از جنس ${p.material} با فرم ${p.fit} برای مراسم و شب‌های خاص انتخاب شده است؛ افتادگی نرم پارچه و دوخت تمیز، ظاهری باوقار و زیبا می‌سازد.`,
  accessories: (p) => `${p.name} از جنس ${p.material} ساخته شده و با جزئیات ساده و ماندگار، لباس رسمی شما را کامل می‌کند.`,
};
const care = {
  "men-suits": "خشک‌شویی توصیه می‌شود. کت را روی چوب‌لباسی پهن و در کاور تنفس‌پذیر نگهداری کنید و پس از هر بار استفاده بگذارید هوا بخورد.",
  "men-separates": "مطابق برچسب مراقبت شست‌وشو یا خشک‌شویی کنید. اتوی ملایم در دمای مناسب پارچه استفاده شود.",
  "women-suits": "خشک‌شویی توصیه می‌شود. برای حفظ فرم شانه‌ها از چوب‌لباسی پهن استفاده کنید.",
  "women-formal": "خشک‌شویی تخصصی توصیه می‌شود. از اتوی مستقیم روی پارچه خودداری کنید و پیراهن را آویزان نگهداری کنید.",
  accessories: "با پارچه نرم و خشک پاک کنید و دور از رطوبت و نور مستقیم خورشید نگهداری کنید.",
};
const sizeNote = (p) =>
  p.sizes
    ? `جدول سایز و برش برای ${p.sizes[0]} تا ${p.sizes[p.sizes.length - 1]} در دسترس است؛ هنگام انتخاب سایز، به برش «${p.fit}» توجه کنید و در صورت تردید با پشتیبانی تماس بگیرید.`
    : "این محصول اندازه واحد دارد.";

const out = products.map((p) => {
  const colors = p.colors.map((c) => c.name).join("، ");
  const long = [
    `<p>${intro[p.cat](p)}</p>`,
    `<h3>ویژگی‌ها</h3><ul><li>جنس: ${p.material}</li>${p.fit !== "—" ? `<li>برش: ${p.fit}</li>` : ""}<li>رنگ: ${colors}</li><li>کد محصول: ${p.sku}</li></ul>`,
    `<h3>راهنمای سایز</h3><p>${sizeNote(p)}</p>`,
    `<h3>نگهداری</h3><p>${care[p.cat]}</p>`,
    `<p><em>توجه: این محصول بخشی از ویترین نمایشی فروشگاه است و تصاویر آن تصویرسازی‌شده‌اند، نه عکس کالای فیزیکی موجود در انبار.</em></p>`,
  ].join("\n");
  return {
    id: p.id, sku: p.sku, slug: p.slug, cat: p.cat, name: p.name, price: p.price, salePrice: p.salePrice ?? null,
    short: p.short, long, tags: p.tags, sizes: p.sizes ?? [], colors: p.colors, variantImages: !!p.variantImages,
    fit: p.fit, material: p.material, gallery: p.gallery.length,
    seoTitle: `${p.name} | خرید آنلاین از شوما`.slice(0, 70),
    seoDescription: `${p.short} ${catName[p.cat]} با دوخت دقیق و ارسال به سراسر ایران؛ خرید آنلاین از فروشگاه شوما.`.slice(0, 160),
  };
});
fs.writeFileSync(new URL("./products.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`wrote ${out.length} products`);
