import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/misc";

export function PageShell({ title, lead, children, crumb }: { title: string; lead?: string; children: ReactNode; crumb?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: crumb ?? title }]} />
      <h1 className="mb-3 mt-6 text-3xl font-bold sm:text-4xl">{title}</h1>
      {lead && <p className="mb-8 text-lg leading-9 text-ink-700">{lead}</p>}
      <div className="space-y-5 leading-9 text-ink-700 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-1 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pr-6">{children}</div>
    </div>
  );
}
