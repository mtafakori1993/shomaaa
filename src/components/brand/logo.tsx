import Link from "next/link";
import { cn } from "@/lib/cn";

/** Jacket-front mark: lapel V, button and a thin outline — drawn to sit on the 4px grid. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M9 4h22a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 4l7 17 7-17" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="20" cy="28" r="2" fill="var(--logo-accent, #a07c4c)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="ltr" className={cn("font-display text-[1.3rem] font-medium leading-none tracking-[0.26em] sm:text-[1.65rem] sm:tracking-[0.3em]", className)}>
      SHOMAAA
    </span>
  );
}

export function Logo({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <Link href="/" aria-label="SHOMAAA شوما · پوشاک رسمی — صفحه اصلی" className={cn("inline-flex items-center gap-2 sm:gap-3", onDark ? "text-ivory-100" : "text-ink-900", className)}>
      <LogoMark className="size-8 shrink-0 sm:size-9" />
      <span className="flex flex-col items-start leading-none">
        <Wordmark />
        <span className="mt-1.5 text-[0.7rem] font-medium tracking-wide text-bronze-700">شوما · پوشاک رسمی</span>
      </span>
    </Link>
  );
}
