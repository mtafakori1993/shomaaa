"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { NAV } from "./nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="باز کردن منو" className="grid size-11 place-items-center rounded-sm hover:bg-ivory-200 lg:hidden">
          <Menu className="size-6" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent title="منو" side="start" description="پیمایش در فروشگاه">
        <nav aria-label="منوی موبایل" className="flex-1 overflow-y-auto p-5">
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <DialogClose asChild>
                  <Link href={n.href} className="flex h-12 items-center rounded-sm px-3 text-lg font-medium hover:bg-ivory-200">{n.label}</Link>
                </DialogClose>
                {n.children && (
                  <ul className="mb-2 mr-3 border-r border-line pr-3">
                    {n.children.map((c) => (
                      <li key={c.href}>
                        <DialogClose asChild>
                          <Link href={c.href} className="flex h-10 items-center px-3 text-ink-700 hover:text-ink-900">{c.label}</Link>
                        </DialogClose>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
