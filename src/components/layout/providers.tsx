"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function CartBootstrap() {
  const refresh = useCart((s) => s.refresh);
  useEffect(() => { void refresh(); }, [refresh]);
  return null;
}

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertCircle : Info;
        return (
          <div key={t.id} className={cn("pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-sm bg-ink-900 px-4 py-3 text-sm text-ivory-50 shadow-overlay animate-[pop-in_180ms_var(--ease-out-quart)]")}>
            <Icon className={cn("size-5 shrink-0", t.tone === "error" ? "text-danger-100" : "text-bronze-300")} aria-hidden />
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="بستن اعلان" className="grid size-8 place-items-center rounded-sm hover:bg-ink-700">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
