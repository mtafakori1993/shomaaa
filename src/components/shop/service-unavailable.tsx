import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ServiceUnavailable({ title = "فروشگاه موقتاً در دسترس نیست" }: { title?: string }) {
  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center" data-testid="service-unavailable">
      <CloudOff className="size-10 text-ink-500" aria-hidden />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-ink-600">ارتباط با سامانه محصولات برقرار نشد. چند لحظه دیگر دوباره تلاش کنید؛ اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/">صفحه اصلی</Button>
        <Button href="/contact" variant="secondary">تماس با پشتیبانی</Button>
      </div>
    </div>
  );
}
