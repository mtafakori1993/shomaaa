export const SITE = {
  name: "شوما",
  latinName: "SHOMAAA",
  domain: "shomaaa.ir",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shomaaa.ir",
  tagline: "پوشاک رسمی مردانه و زنانه",
  description:
    "شوما؛ فروشگاه آنلاین کت‌وشلوار، بلیزر، پیراهن، پوشاک مجلسی و اکسسوری رسمی مردانه و زنانه با دوخت دقیق و ارسال به سراسر ایران.",
  phone: "09040153212",
  phoneDisplay: "۰۹۰۴۰۱۵۳۲۱۲",
  email: "info@tafakorpardazan.ir",
  attribution: { text: "طراحی و توسعه توسط تفکر پردازان", href: "https://tafakorpardazan.ir", domain: "tafakorpardazan.ir" },
  freeShippingThreshold: 15_000_000,
  // Demo storefront: orders are recorded in WooCommerce, but no money is collected.
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "0",
} as const;

export const WORDPRESS_URL = process.env.WORDPRESS_URL ?? "http://localhost:8089";
