"use client";

import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

interface ContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  side?: "start" | "end" | "center";
  className?: string;
  hideTitle?: boolean;
}

/** Modal with focus trap, ESC to close, aria-labelledby — Radix primitives, Spectrum-style tray/modal visuals. */
export function DialogContent({ title, description, children, side = "center", className, hideTitle }: ContentProps) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-[2px] data-[state=open]:animate-[overlay-in_160ms_ease-out]" />
      <D.Content
        aria-describedby={description ? undefined : undefined}
        className={cn(
          "fixed z-50 flex flex-col bg-ivory-50 shadow-overlay outline-none",
          side === "center" && "left-1/2 top-1/2 max-h-[88dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-md data-[state=open]:animate-[pop-in_180ms_var(--ease-out-quart)]",
          side === "start" && "inset-y-0 right-0 w-[min(92vw,24rem)] data-[state=open]:animate-[slide-in-end_240ms_var(--ease-out-quart)]",
          side === "end" && "inset-y-0 left-0 w-[min(94vw,28rem)] data-[state=open]:animate-[slide-in-start_240ms_var(--ease-out-quart)]",
          className,
        )}
      >
        <div className={cn("flex items-center justify-between border-b border-line px-5 py-3", hideTitle && "sr-only")}>
          <D.Title className="text-lg font-bold">{title}</D.Title>
          <D.Close aria-label="بستن" className="grid size-10 place-items-center rounded-sm text-ink-700 hover:bg-ivory-200">
            <X className="size-5" aria-hidden />
          </D.Close>
        </div>
        {description ? <D.Description className="sr-only">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
        {hideTitle && (
          <D.Close aria-label="بستن" className="absolute left-3 top-3 z-10 grid size-10 place-items-center rounded-sm text-ink-700 hover:bg-ivory-200">
            <X className="size-5" aria-hidden />
          </D.Close>
        )}
        {children}
      </D.Content>
    </D.Portal>
  );
}
