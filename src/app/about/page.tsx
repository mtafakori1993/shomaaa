import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "درباره شوما", description: "داستان شوما؛ برندی برای پوشاک رسمی مردانه و زنانه با تمرکز بر برش دقیق، پارچه مناسب و اکسسوری کامل.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <PageShell title="درباره شوما" lead="شوما برای کسانی ساخته شده که لباس رسمی را فقط یک الزام نمی‌دانند؛ بخشی از شخصیت و آرامش خودشان می‌دانند.">
      <div className="relative -mx-4 aspect-[16/9] overflow-hidden rounded-xs sm:mx-0">
        <Image src="/media/editorial/seasonal.webp" alt="آتلیه شوما با رگال لباس‌های رسمی؛ تصویر نمونه" fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
      </div>
      <h2>نگاه ما</h2>
      <p>هر قطعه در شوما با سه پرسش انتخاب می‌شود: برش آن چقدر دقیق است؟ پارچه آن برای کاربرد روزانه مناسب است؟ و آیا کنار بقیه لباس‌های شما می‌نشیند؟ نتیجه، مجموعه‌ای محدود اما هماهنگ از کت‌وشلوار، بلیزر، پیراهن، پوشاک مجلسی و اکسسوری است.</p>
      <h2>مردانه و زنانه، با یک زبان</h2>
      <p>رنگ‌های خاکی و آرام، خطوط ساده و جزئیات کم‌ادعا زبان مشترک مجموعه‌های مردانه و زنانه است؛ تا بتوانید لباس مناسب جلسه، مراسم یا مهمانی را بدون سردرگمی پیدا کنید.</p>
      <h2>درباره این ویترین</h2>
      <p>این وب‌سایت یک فروشگاه نمایشی است. محصولات و قیمت‌ها نمونه‌اند و تصاویر آن‌ها با هوش مصنوعی تصویرسازی شده‌اند، نه عکس کالای موجود در انبار.</p>
      <Button href="/collections/all">مشاهده محصولات</Button>
    </PageShell>
  );
}
