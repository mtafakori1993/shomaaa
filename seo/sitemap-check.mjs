// Crawls sitemap_index.xml → child sitemaps → every URL. Output: seo/data/sitemap-<label>.json
import fs from "node:fs";
const label = process.argv[2] ?? "after";
const B = "https://tafakorpardazan.ir";
async function get(u, opt = {}) { for (let i = 0; i < 5; i++) { try { const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(60000), ...opt }); return { status: r.status, text: await r.text(), headers: r.headers, loc: r.headers.get("location") }; } catch { await new Promise((r) => setTimeout(r, 1200)); } } return { status: 0, text: "", headers: new Headers() }; }
const locs = (xml, tag = "loc") => [...xml.matchAll(new RegExp(`<url>[\\s\\S]*?</url>|<sitemap>[\\s\\S]*?</sitemap>`, "g"))].map((m) => ({ loc: (m[0].match(/<loc>([^<]+)<\/loc>/) || [])[1], lastmod: (m[0].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] }));
const out = { generated: new Date().toISOString(), index: {}, children: [], urls: [] };
const idx = await get(`${B}/sitemap_index.xml`);
out.index = { status: idx.status, contentType: idx.headers.get("content-type"), wellFormed: /<sitemapindex[\s\S]*<\/sitemapindex>\s*$/.test(idx.text) };
out.legacy = { "/sitemap.xml": { status: (await get(`${B}/sitemap.xml`)).status, location: (await get(`${B}/sitemap.xml`)).loc } };
const robots = await get(`${B}/robots.txt`); out.robots = { status: robots.status, sitemapDirective: (robots.text.match(/^Sitemap:\s*(\S+)/im) || [])[1] };
for (const c of locs(idx.text)) {
  const r = await get(c.loc); const entries = locs(r.text).filter((e) => e.loc);
  out.children.push({ url: c.loc, lastmod: c.lastmod, status: r.status, bytes: r.text.length, entries: entries.length, xmlOk: /<urlset[\s\S]*<\/urlset>\s*$/.test(r.text) });
  for (const e of entries) out.urls.push({ sitemap: c.loc.split("/").pop(), ...e });
}
let next = 0;
async function worker() {
  while (next < out.urls.length) {
    const u = out.urls[next++]; const r = await get(u.loc); const h = r.text;
    u.status = r.status; u.redirect = r.loc ?? null;
    u.canonical = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] ?? null;
    u.robots = (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] ?? null;
    u.lang = (h.match(/<html[^>]*lang="([^"]+)"/) || [])[1] ?? null;
    u.h1 = (h.match(/<h1\b/g) || []).length;
    u.title = ((h.match(/<title>([^<]*)/) || [])[1] ?? "").replace(/&#039;/g, "'");
    u.canonicalMatches = u.canonical === u.loc; u.noindex = /noindex/i.test(u.robots ?? "");
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
fs.writeFileSync(`seo/data/sitemap-${label}.json`, JSON.stringify(out, null, 1));
const bad = out.urls.filter((u) => u.status !== 200 || !u.canonicalMatches || u.noindex || !u.loc.startsWith(B + "/"));
console.log(JSON.stringify({ index: out.index, robots: out.robots, children: out.children.map((c) => `${c.url.split("/").pop()}:${c.status}:${c.entries}:${c.xmlOk}`), urls: out.urls.length, problems: bad.map((u) => ({ loc: u.loc, status: u.status, canonical: u.canonical, robots: u.robots })) }, null, 1));
