// Offline Yoast SEO + readability analysis using the official `yoastseo` library (same assessors as the plugin's editor).
// Usage: node seo/analyze.cjs <items.json> <out.json>   (items: from export.php, optionally patched with new meta)
const fs = require("fs");
const y = require("yoastseo");
const { build } = require("yoastseo/build/parse/build");
const LanguageProcessor = require("yoastseo/build/parse/language/LanguageProcessor.js").default;
const FaResearcher = require("yoastseo/build/languageProcessing/languages/fa/Researcher.js").default;
const EnResearcher = require("yoastseo/build/languageProcessing/languages/en/Researcher.js").default;
const { chromium } = require("@playwright/test");

const clean = (html) => html.replace(/<!--[\s\S]*?-->/g, "").trim();
async function titleWidths(titles) {
  // Yoast measures the SEO title in a hidden element: arial 20px, weight 400.
  const b = await chromium.launch(); const p = await b.newPage();
  const w = await p.evaluate((ts) => ts.map((t) => { const d = document.createElement("div"); d.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-family:arial,sans-serif;font-size:20px;font-weight:400"; d.textContent = t; document.body.appendChild(d); const r = d.offsetWidth; d.remove(); return r; }), titles);
  await b.close(); return w;
}
const rate = (s) => (s >= 71 ? "green" : s >= 41 ? "orange" : s > 0 ? "red" : "none");

(async () => {
  const items = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const widths = await titleWidths(items.map((i) => i.seo_title_rendered));
  const out = [];
  items.forEach((it, idx) => {
    const locale = it.lang === "en" ? "en_US" : "fa_IR";
    const Researcher = it.lang === "en" ? EnResearcher : FaResearcher;
    const paper = new y.Paper(clean(it.content), {
      keyword: it.focuskw || "", title: it.seo_title_rendered || "", titleWidth: widths[idx], description: it.metadesc_rendered || "",
      slug: it.post_name, permalink: it.permalink, locale, textTitle: it.title,
    });
    const researcher = new Researcher(paper);
    paper.setTree(build(paper, new LanguageProcessor(researcher), undefined));
    const seo = new y.assessors.SEOAssessor(researcher); seo.assess(paper);
    const read = new y.assessors.ContentAssessor(researcher); read.assess(paper);
    const detail = (a) => a.getValidResults().map((r) => ({ id: r.getIdentifier?.() ?? "", score: r.getScore(), text: String(r.getText()).replace(/<[^>]+>/g, "") })).filter((r) => r.score < 9);
    const s = seo.calculateOverallScore(), r = read.calculateOverallScore();
    out.push({ id: it.id, type: it.type, lang: it.lang, title: it.title, seo_score: s, seo: rate(s), read_score: r, read: rate(r), seo_problems: detail(seo), read_problems: detail(read), stored_linkdex: it.linkdex, stored_content_score: it.content_score, title_width: widths[idx] });
  });
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  const c = (k) => out.reduce((m, o) => ((m[o[k]] = (m[o[k]] || 0) + 1), m), {});
  console.log("seo", c("seo"), "readability", c("read"));
})().catch((e) => { console.error(e); process.exit(1); });
