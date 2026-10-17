# Sitemap validation — https://tafakorpardazan.ir (checked 2026-10-17, after changes)

Method: `seo/sitemap-check.mjs` crawled `sitemap_index.xml` → every child sitemap → every listed URL (214 URLs), recording HTTP status, canonical, robots meta, `<html lang>` and `<h1>` count; all 15 XML files were also parsed with Python's `xml.etree` (not just regex).

| Item | Result |
|---|---|
| Generator | Yoast SEO 28.6 (`wordpress-seo`); the only sitemap plugin. No competing sitemap was created. |
| `/robots.txt` | 200; `Sitemap: https://tafakorpardazan.ir/sitemap_index.xml` (correct, HTTPS, same host); `Disallow:` empty (nothing blocked) |
| `/sitemap_index.xml` | 200, `text/xml`, valid XML, 14 child sitemaps |
| `/sitemap.xml` | 301 → `/sitemap_index.xml` (single hop, no chain) |
| Child sitemaps | all 14 return 200 and parse as valid XML; largest has 69 URLs (limits are 50,000 URLs / 50 MB) |
| URLs crawled | 214; **all return 200**, none redirect, host is always `https://tafakorpardazan.ir` |
| Canonical consistency | 214/214 canonical = sitemap URL (after percent-decoding; Persian slugs are listed percent-encoded and canonicals are written decoded — equivalent URLs) |
| `lastmod` | present on every entry |
| noindex URLs in sitemap | 0 (the 6 placeholder projects set to noindex in this audit were removed from `tp_project-sitemap.xml` automatically by Yoast; it now lists 22 projects + the 2 archive URLs) |
| Published + indexable but missing from sitemap | 0 (checked against the 78-item inventory) |
| Draft / private / redirected URLs listed | none found |

## Content types in the index
`post` 7, `page` 7, `video` 7, `tp_service` 14, `tp_product` 14, `tp_solution` 14, `tp_project` 24, `category` 6, `post_tag` 27, `video_category` 5, `video_tag` 5, `tp_project_category` 14, `tp_technology` 69, `author` 1 (fa + en).
(`tp_product` 14 = 12 products + the two archive URLs; the same for projects.)

## Observations (not changed)
- `tp_technology` (69 URLs), `post_tag` (27), `author`, `video_tag` archives are thin listing pages. They are valid and indexable and were left alone on purpose: they may carry some long-tail value and the instructions forbid blanket noindex. Recommendation: review them in Search Console and consider noindex for technology/tag archives with fewer than ~3 items.
- Persian URLs are percent-encoded in the sitemap (normal for non-Latin slugs).
- Pages `/home/` (en, 0 words) and `/en/articles/`, `/blog/` are listing pages with no body text; they are indexable and have no custom meta description (see remaining issues).
