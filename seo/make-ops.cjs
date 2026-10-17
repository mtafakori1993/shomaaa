const fs = require("fs");
const { build, buildPost, snap, f } = require("./content-plan.cjs");
const ops = [];
for (const id of new Set([...Object.keys(f), 115, 116, 118, 119, 126, 128].map(Number))) {
  const it = snap[id]; const x = f[id]; const meta = {};
  if (x) {
    meta._yoast_wpseo_title = x.title; meta._yoast_wpseo_metadesc = x.desc;
    if (x.kw) meta._yoast_wpseo_focuskw = x.kw;
    if (x.noindex) meta["_yoast_wpseo_meta-robots-noindex"] = "1";
  }
  const c = x ? build(id) : buildPost(id);
  const content = c && !it.content.includes("tp-seo:v1") ? c.top + it.content + c.bottom : null;
  ops.push({ id, type: it.type, lang: it.lang, meta, content, before_sha1: it.content_sha1 });
}
fs.writeFileSync("data/ops.json", JSON.stringify(ops));
console.log(ops.length, "ops;", ops.filter((o) => o.content).length, "with content changes;", ops.filter((o) => o.meta["_yoast_wpseo_meta-robots-noindex"]).length, "noindex");
