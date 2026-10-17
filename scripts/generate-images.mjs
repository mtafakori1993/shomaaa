#!/usr/bin/env node
/**
 * Resumable AI product-image generator (OpenRouter chat-completions image API).
 *
 *   node scripts/generate-images.mjs --dry-run                 # estimate only
 *   node scripts/generate-images.mjs --only 1,2 --model google/gemini-nano-banana-2.1
 *   node scripts/generate-images.mjs --kind editorial
 *
 * Env (never committed): OPENROUTER_API_KEY, IMAGE_MODEL (default below), IMAGE_EDITORIAL_MODEL.
 * Raw originals -> assets-src/raw ; optimized WebP -> public/media ; state -> generated/manifest.json
 * Successful items are skipped on rerun (use --force to regenerate).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { products, editorial, STYLE_SUFFIX } from "../catalog/products.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

const API = "https://openrouter.ai/api/v1";
const MODEL = opt("model", process.env.IMAGE_MODEL || "google/gemini-nano-banana-2.1");
const EDITORIAL_MODEL = opt("editorial-model", process.env.IMAGE_EDITORIAL_MODEL || MODEL);
const KIND = opt("kind", "all"); // products | variants | gallery | editorial | all
const ONLY = (opt("only", "") || "").split(",").filter(Boolean);
const LIMIT = Number(opt("limit", "0")) || Infinity;
const MAX_COST = Number(opt("max-cost", "1.0")); // hard stop in USD for this run
const OUT = path.join(ROOT, "public/media");
const RAW = path.join(ROOT, "assets-src/raw");
const MANIFEST = path.join(ROOT, "generated/manifest.json");
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : { items: {} };
const save = () => { fs.mkdirSync(path.dirname(MANIFEST), { recursive: true }); fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)); };

const colorEn = (id) => id;
function jobs() {
  const list = [];
  for (const p of products) {
    if (ONLY.length && !ONLY.includes(String(p.id)) && !ONLY.includes(p.slug)) continue;
    const base = p.kind === "flat" ? "Still-life" : "Ghost-mannequin";
    const color1 = p.variantImages ? `, in ${colorEn(p.colors[0].id)} color` : "";
    if (["all", "products"].includes(KIND))
      list.push({ key: `${p.slug}/main`, file: `products/${p.slug}/main`, aspect: "4:5", prompt: `${p.prompt}${color1}. ${STYLE_SUFFIX}.`, model: MODEL, kind: "products" });
    if (["all", "variants"].includes(KIND) && p.variantImages)
      for (const c of p.colors.slice(1))
        list.push({ key: `${p.slug}/color-${c.id}`, file: `products/${p.slug}/color-${c.id}`, aspect: "4:5", prompt: `${p.prompt}, in ${colorEn(c.id)} color. ${STYLE_SUFFIX}.`, model: MODEL, kind: "variants" });
    if (["all", "gallery"].includes(KIND))
      p.gallery.forEach((g, i) => list.push({ key: `${p.slug}/gallery-${i + 1}`, file: `products/${p.slug}/gallery-${i + 1}`, aspect: "4:5", prompt: `${g}. ${STYLE_SUFFIX}.`, model: MODEL, kind: "gallery" }));
  }
  if (["all", "editorial"].includes(KIND) && !ONLY.length)
    for (const e of editorial) list.push({ key: `editorial/${e.id}`, file: `editorial/${e.id}`, aspect: e.aspect, prompt: e.prompt, model: EDITORIAL_MODEL, kind: "editorial" });
  return list;
}

async function pricing(model) {
  const r = await fetch(`${API}/models?output_modalities=image`, { signal: AbortSignal.timeout(30000) });
  const m = (await r.json()).data.find((x) => x.id === model);
  if (!m) throw new Error(`Model ${model} not found in OpenRouter image-model catalog`);
  return m;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(job, modalities) {
  const body = {
    model: job.model,
    messages: [{ role: "user", content: job.prompt }],
    modalities,
    image_config: { aspect_ratio: job.aspect },
  };
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${API}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "X-Title": "SHOMAAA catalog" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(240000),
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** attempt;
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(wait);
        continue;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json.error || json).slice(0, 300)}`);
      const msg = json.choices?.[0]?.message;
      const url = msg?.images?.[0]?.image_url?.url;
      if (!url?.startsWith("data:image/")) throw new Error(`No image in response (finish=${json.choices?.[0]?.finish_reason}): ${String(msg?.content).slice(0, 160)}`);
      return { buf: Buffer.from(url.split(",")[1], "base64"), cost: json.usage?.cost ?? null, usage: json.usage };
    } catch (e) {
      lastErr = e;
      if (/HTTP 4(0[0-9]|1[0-9]|2[0-8])/.test(String(e.message))) break; // non-retryable client error
      await sleep(1500 * attempt);
    }
  }
  throw lastErr;
}

async function main() {
  const all = jobs().filter((j) => flag("force") || manifest.items[j.key]?.status !== "ok" || !fs.existsSync(path.join(OUT, j.file + ".webp")));
  const todo = all.slice(0, LIMIT);
  const info = await pricing(MODEL);
  const perImage = Number(info.pricing.image) || Number(info.pricing.image_output) * 1290; // ~1290 tokens for a 1K image
  console.log(`Model ${MODEL} | pricing ${JSON.stringify(info.pricing)} | est. $${perImage.toFixed(4)}/image`);
  console.log(`Planned: ${todo.length} images (of ${all.length} pending) | est. total $${(todo.length * perImage).toFixed(3)}`);
  if (flag("dry-run")) return;
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set");
  const modalities = info.architecture.output_modalities.includes("text") ? ["image", "text"] : ["image"];
  let spent = 0, ok = 0, failed = 0;
  for (const job of todo) {
    if (spent >= MAX_COST) { console.log(`Stopped: run cost cap $${MAX_COST} reached`); break; }
    try {
      const { buf, cost, usage } = await generate(job, modalities);
      const meta = await sharp(buf).metadata();
      if (!["png", "jpeg", "webp"].includes(meta.format)) throw new Error(`unexpected format ${meta.format}`);
      if (!meta.width || meta.width < 512 || !meta.height || meta.height < 512) throw new Error(`image too small ${meta.width}x${meta.height}`);
      if (buf.length < 20_000) throw new Error(`suspiciously small file ${buf.length}B`);
      const rawPath = path.join(RAW, `${job.file}.${meta.format}`);
      fs.mkdirSync(path.dirname(rawPath), { recursive: true }); fs.writeFileSync(rawPath, buf);
      const outPath = path.join(OUT, `${job.file}.webp`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(outPath);
      const o = await sharp(outPath).metadata();
      spent += cost ?? perImage;
      manifest.items[job.key] = { status: "ok", model: job.model, cost: cost ?? null, estimated: cost == null, width: o.width, height: o.height, bytes: fs.statSync(outPath).size, at: new Date().toISOString() };
      ok++;
      console.log(`✓ ${job.key} ${o.width}x${o.height} ${(fs.statSync(outPath).size / 1024).toFixed(0)}KB cost=${cost ?? "n/a"}`);
    } catch (e) {
      failed++;
      manifest.items[job.key] = { status: "failed", model: job.model, error: String(e.message).slice(0, 300), at: new Date().toISOString() };
      console.error(`✗ ${job.key}: ${e.message}`);
    }
    save();
  }
  console.log(`Done: ${ok} ok, ${failed} failed, spent ≈ $${spent.toFixed(4)}`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
