// Patches the before-snapshot with seo/fields.json and writes a "would-be" item set for offline Yoast scoring.
const fs = require("fs");
const { build, buildPost } = require("./content-plan.cjs");
const items = JSON.parse(fs.readFileSync("data/snapshot-before.json", "utf8"));
const f = JSON.parse(fs.readFileSync("fields.json", "utf8"));
for (const it of items) { const pc = buildPost(it.id); if (pc && !it.content.includes("tp-seo:v1")) it.content = pc.top + it.content + pc.bottom; const x = f[it.id]; if (!x) continue; it.focuskw = x.kw; it.seo_title_rendered = x.title; it.metadesc_rendered = x.desc; const c = build(it.id); if (c && !it.content.includes("tp-seo:v1")) it.content = c.top + it.content + c.bottom; }
fs.writeFileSync("data/snapshot-planned.json", JSON.stringify(items));
