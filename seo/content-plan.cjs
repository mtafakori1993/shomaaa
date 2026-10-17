// Builds the content additions (lead + H2 + related links) for each planned item. Pure function: used by preview and apply.
const fs = require("fs");
const snap = Object.fromEntries(JSON.parse(fs.readFileSync(__dirname + "/data/snapshot-before.json", "utf8")).map((x) => [x.id, x]));
const f = JSON.parse(fs.readFileSync(__dirname + "/fields.json", "utf8"));

const PAIR = { 124: 125, 126: 128, 116: 115, 119: 118, 137: 176, 141: 178, 148: 180, 154: 181, 160: 182, 164: 183, 166: 184, 168: 185, 170: 186, 213: 214, 220: 230, 31: 53, 32: 54, 172: 177, 173: 179, 211: 212 };
const EN2FA = Object.fromEntries(Object.entries(PAIR).map(([a, b]) => [b, +a]));
const RELATED = { 124: [126, 32], 137: [141, 213], 141: [137, 160], 148: [154, 137], 154: [166, 148], 160: [164, 220], 164: [168, 160], 166: [154, 220], 168: [164, 170], 170: [168, 164], 213: [137, 141], 220: [164, 160],
  31: [211, 32], 32: [173, 31], 172: [137, 173], 173: [141, 172], 211: [213, 31] };
const SERVICE = { // fa service id -> en id
  ai: [19, 41, "هوش مصنوعی", "Artificial Intelligence"], sw: [21, 43, "توسعه نرم‌افزار", "Software Development"], voice: [20, 42, "پردازش صوت و زبان", "Voice & Language Processing"], hw: [22, 44, "سخت‌افزار هوشمند", "Intelligent Hardware"] };
const SVC = { 137: "voice", 172: "voice", 141: "sw", 173: "sw", 148: "sw", 154: "sw", 160: "sw", 164: "sw", 166: "sw", 168: "sw", 170: "sw", 213: "ai", 211: "ai", 220: "sw", 31: "ai", 32: "sw" };
const CONTACT = { fa: 8, en: 40 };

const faId = (id) => EN2FA[id] ?? id;
const mapTo = (faTarget, lang) => (lang === "en" ? PAIR[faTarget] : faTarget);
const link = (id, text) => `<a href="${snap[id].permalink}">${text}</a>`;
const shortName = (it) => it.title.replace(/\s*\(.*?\)\s*/g, "").replace(/[؛:].*$/, "").trim();

function build(id) {
  const it = snap[id], fl = f[id]; if (!fl || fl.noindex || !fl.kw) return null; // eslint-disable-line
  const lang = it.lang, fid = faId(id);
  const rel = (RELATED[fid] || []).map((t) => mapTo(t, lang)).filter((t) => snap[t]);
  const svcKey = SVC[fid]; const svc = svcKey ? SERVICE[svcKey] : null;
  const kwU = lang === "en" ? fl.kw[0].toUpperCase() + fl.kw.slice(1) : fl.kw;
  const lead = fl.desc;
  const h2 = fl.h2_neutral ? (lang === "en" ? "Details and key features" : "جزئیات و ویژگی‌ها") : lang === "en" ? `${kwU}: details and key features` : `${fl.kw}: جزئیات و ویژگی‌ها`;
  const relH = lang === "en" ? "Related projects and services" : "پروژه‌ها و خدمات مرتبط";
  const pieces = [];
  if (rel.length) pieces.push(lang === "en" ? `Related work: ${rel.map((r) => link(r, shortName(snap[r]))).join(" and ")}.` : `نمونه‌های مرتبط: ${rel.map((r) => link(r, shortName(snap[r]))).join(" و ")}.`);
  if (svc) pieces.push(lang === "en" ? `This work belongs to our ${link(svc[1], svc[3] + " services")}.` : `این کار بخشی از ${link(svc[0], "خدمات " + svc[2])} تفکر پردازان است.`);
  pieces.push(lang === "en" ? `To discuss a similar project, ${link(CONTACT.en, "contact Tafakor Pardazan")}.` : `برای گفت‌وگو درباره پروژه مشابه، ${link(CONTACT.fa, "با تفکر پردازان تماس بگیرید")}.`);
  const top = fl.no_lead ? "<!-- tp-seo:v1 -->\n" : `<!-- tp-seo:v1 -->\n<!-- wp:paragraph -->\n<p>${lead}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>${h2}</h2>\n<!-- /wp:heading -->\n\n`;
  const bottom = `\n\n<!-- wp:heading -->\n<h2>${relH}</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>${pieces.join(" ")}</p>\n<!-- /wp:paragraph -->`;
  return { top, bottom };
}

// Posts: already well optimised; only add contextual internal links (no lead/H2 rewrite).
const POST_LINKS = { 116: { prod: 31, svc: "voice" }, 119: { prod: 31, svc: "ai" }, 126: { prod: 124, svc: "sw" } };
function buildPost(id) {
  const it = snap[id], fid = faId(id); const pl = POST_LINKS[fid]; if (!pl) return null;
  const lang = it.lang, prod = mapTo(pl.prod, lang), svc = SERVICE[pl.svc];
  const parts = lang === "en"
    ? [`Related: ${link(prod, shortName(snap[prod]))}.`, `See our ${link(svc[1], svc[3] + " services")}, or ${link(CONTACT.en, "contact Tafakor Pardazan")} about your project.`]
    : [`مطلب مرتبط: ${link(prod, shortName(snap[prod]))}.`, `${link(svc[0], "خدمات " + svc[2])} تفکر پردازان را ببینید یا برای پروژه خود ${link(CONTACT.fa, "با ما تماس بگیرید")}.`];
  return { top: "<!-- tp-seo:v1 -->\n", bottom: `\n\n<!-- wp:paragraph -->\n<p>${parts.join(" ")}</p>\n<!-- /wp:paragraph -->` };
}
module.exports = { build, buildPost, snap, f };
