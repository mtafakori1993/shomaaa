import { z } from "zod";
import { IR_STATES } from "./iran";
import { toEnDigits } from "./format";

const digits = (s: string) => toEnDigits(s).replace(/[\s-]/g, "");

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "نام را وارد کنید").max(50),
  lastName: z.string().trim().min(2, "نام خانوادگی را وارد کنید").max(60),
  email: z.string().trim().toLowerCase().email("ایمیل معتبر وارد کنید").max(120),
  phone: z.string().transform(digits).pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد")),
  state: z.string().refine((s) => s in IR_STATES, "استان را انتخاب کنید"),
  city: z.string().trim().min(2, "شهر را وارد کنید").max(60),
  address: z.string().trim().min(10, "نشانی کامل‌تر وارد کنید").max(300),
  postcode: z.string().transform(digits).pipe(z.string().regex(/^\d{10}$/, "کدپستی باید ۱۰ رقم باشد")),
  note: z.string().trim().max(500).optional().default(""),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;
