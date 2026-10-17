const faNumber = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const faDigits = "۰۱۲۳۴۵۶۷۸۹";

export const formatNumber = (n: number) => faNumber.format(n);
export const formatToman = (n: number) => `${faNumber.format(n)} تومان`;
export const toFaDigits = (s: string | number) => String(s).replace(/\d/g, (d) => faDigits[Number(d)]);
export const toEnDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d))).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
export const discountPercent = (regular: number, sale: number) => Math.round(((regular - sale) / regular) * 100);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "Asia/Tehran" }).format(new Date(iso));
