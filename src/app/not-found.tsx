import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-28 text-center" data-testid="not-found">
      <p className="font-display text-7xl text-bronze-500" aria-hidden>۴۰۴</p>
      <h1 className="text-2xl font-bold">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="text-ink-600">ممکن است نشانی تغییر کرده یا محصول دیگر موجود نباشد.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/">صفحه اصلی</Button>
        <Button href="/collections/all" variant="secondary">مشاهده محصولات</Button>
      </div>
    </div>
  );
}
