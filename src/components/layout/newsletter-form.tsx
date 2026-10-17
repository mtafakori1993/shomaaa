"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email("ایمیل معتبر وارد کنید");

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setError(""); setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: parsed.data }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error && err.message ? err.message : "ثبت ایمیل انجام نشد؛ دوباره تلاش کنید");
    }
  }

  if (state === "done") return <p role="status" className="text-sm text-bronze-300">ایمیل شما ثبت شد. سپاس از همراهی شما.</p>;
  const dark = tone === "dark";
  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <label htmlFor="nl-email" className="sr-only">ایمیل</label>
      <div className="flex gap-2">
        <input
          id="nl-email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" placeholder="you@example.com"
          aria-invalid={!!error || undefined} aria-describedby={error ? "nl-err" : undefined}
          className={`h-11 min-w-0 flex-1 rounded-sm border px-3 text-base placeholder:text-ink-500 ${dark ? "border-ink-600 bg-ink-800 text-ivory-50" : "border-ink-500/50 bg-ivory-50"}`}
        />
        <Button type="submit" variant={dark ? "accent" : "primary"} loading={state === "loading"}>عضویت</Button>
      </div>
      {error && <p id="nl-err" role="alert" className={`text-sm ${dark ? "text-danger-100" : "text-danger-600"}`}>{error}</p>}
    </form>
  );
}
