// Tiny authenticated REST helper (creds from env TP_USER / TP_APP_PASSWORD; never printed).
const SITE = process.env.TP_SITE ?? "https://tafakorpardazan.ir";
const AUTH = "Basic " + Buffer.from(`${process.env.TP_USER}:${process.env.TP_APP_PASSWORD}`).toString("base64");
export async function api(p, init = {}, tries = 5) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(`${SITE}/wp-json${p}`, { ...init, headers: { Authorization: AUTH, ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers ?? {}) }, body: init.body && typeof init.body !== "string" ? JSON.stringify(init.body) : init.body, signal: AbortSignal.timeout(90_000) });
      const text = await r.text(); const i0 = Math.min(...["{", "["].map((c) => text.indexOf(c)).filter((x) => x >= 0));
      const json = text ? JSON.parse(text.slice(i0)) : null;
      if (!r.ok) throw Object.assign(new Error(`${r.status} ${json?.message ?? ""}`), { status: r.status, json });
      return { json, headers: r.headers };
    } catch (e) { last = e; if (e.status && e.status < 500) break; await new Promise((r) => setTimeout(r, 1500 * i)); }
  }
  throw last;
}
export async function fetchText(u, tries = 5) {
  for (let i = 0; i < tries; i++) { try { const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(60_000) }); return { status: r.status, text: await r.text(), headers: r.headers }; } catch { await new Promise((r) => setTimeout(r, 1000)); } }
  return { status: 0, text: "", headers: new Headers() };
}
