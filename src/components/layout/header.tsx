import Link from "next/link";
import { User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "./cart-drawer";
import { SearchDialog } from "./search-dialog";
import { MobileMenu } from "./mobile-menu";
import { NAV } from "./nav";
import { SITE } from "@/lib/config";

export function AnnouncementBar() {
  return (
    <div className="bg-ink-900 text-ivory-100" data-on-dark>
      <p className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-6 gap-y-0.5 px-4 py-2 text-center text-xs sm:text-sm">
        <span>ارسال رایگان برای خرید بالای ۱۵ میلیون تومان</span>
        <span className="hidden sm:inline text-bronze-300" aria-hidden>·</span>
        <span>پشتیبانی: <a href={`tel:${SITE.phone}`} className="ltr underline underline-offset-4">{SITE.phone}</a></span>
      </p>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory-100/95 backdrop-blur supports-[backdrop-filter]:bg-ivory-100/85">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1440px] items-center gap-1 px-3 sm:gap-2 sm:px-6 lg:gap-8">
        <MobileMenu />
        <Logo className="ml-auto lg:ml-0" />
        <nav aria-label="منوی اصلی" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href} className="group relative">
                <Link href={n.href} className="flex h-11 items-center rounded-sm px-3 text-[0.95rem] font-medium hover:bg-ivory-200">{n.label}</Link>
                {n.children && (
                  <ul className="invisible absolute right-0 top-full z-10 min-w-56 rounded-sm border border-line bg-ivory-50 p-2 opacity-0 shadow-raised transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {n.children.map((c) => (
                      <li key={c.href}><Link href={c.href} className="flex h-10 items-center rounded-xs px-3 text-sm hover:bg-ivory-200">{c.label}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center">
          <SearchDialog />
          <Link href="/account" aria-label="حساب کاربری و پیگیری" className="hidden size-11 place-items-center rounded-sm hover:bg-ivory-200 sm:grid">
            <User className="size-5" aria-hidden />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
