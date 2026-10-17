# SEO audit & optimisation — tafakorpardazan.ir (2026-10-17)

## 1. Environment (discovered, not assumed)
- WordPress on k3s (`tpsite` namespace), theme `tafakorpardazan` (no child theme), permalinks pretty, Polylang 3.8 (fa default, en under `/en/`).
- **Yoast SEO Free 28.6** is the SEO plugin. **WooCommerce is not installed**: the «products» are the custom post type `tp_product` (6 fa + 6 en); «projects» are `tp_project` (14 + 14); also `post` (3 + 3), `tp_service`, `tp_solution`, `page`.
- Other plugins: Contact Form 7, Polylang, three in-house plugins (video player, videos, team). Akismet/Hello inactive.
- Only production exists (no staging). Git: the site repo (`tafakor-pardazan/tpsite`) was cloned read-only; nothing in it was edited — all changes were made through WordPress APIs on content, not code.
- No WP-CLI in the production image. Reads/writes used `wp-load.php` + WordPress functions inside the pod (`wp_update_post` with `meta_input`, so Yoast re-indexes on save) and the REST API.

## 2. Backups and rollback
- **Database dump** taken first (existing `mysql-backup` CronJob run as Job `seo-pre-audit-2009`): `/backup/db_2026-10-17_163950.sql.gz` in PVC `db-backups` (ns `tpsite`).
- **Content+meta snapshot** of all 78 published items before changes: `seo/data/snapshot-before.json` (post_content, Yoast title/description/keyphrase/noindex, SHA-1).
- **Rollback** (content + SEO meta only): copy `snapshot-before.json` and `data/ops.json` to `/tmp` in the wordpress pod and run `php seo/rollback.php` (add `--dry` first). Full restore alternative: `gunzip -c db_2026-10-17_163950.sql.gz | mysql …` from a helper pod.
- Nothing was deleted; no URL, slug, permalink, redirect or setting was changed.

## 3. What was audited
78 published items inventoried (`seo-url-inventory.csv`). **Audited and optimised: 46 = 12 products (`tp_product`), 6 posts, 28 projects.** Services, solutions and pages were inventoried only (see remaining issues). Drafts/private content: none touched.

## 4. Findings (before) and what was done
| Finding | Before (46 target items) | After |
|---|---|---|
| No focus keyphrase | 38 | 6 (the 6 placeholder projects, deliberately) |
| No meta description | 38 | 0 |
| No custom SEO title (default «Title - Site») | 38 | 0 |
| Identical title between product and project pages (TP Call, TP Accounting, AI assistant, Qlean…) | yes | differentiated titles and keyphrases per page type |
| Pages with zero internal links | 30 | 6 (the placeholders) |
| Published pages whose body says «this content is a placeholder» (projects 33/34/35 fa, 55/56/57 en) | 6 indexable | 6 set to **noindex** (individually, with reasoning; they are removed from the sitemap by Yoast). Not deleted. Reverting = clear the Yoast «noindex» field |
| Keyphrase absent from intro/subheading | almost all | lead sentence + H2 added where needed |
| Sitemap / robots / canonicals | valid | unchanged (see `sitemap-validation.md`) |

Changes made (46 pages): Yoast SEO title, meta description, focus keyphrase (`seo-changes.csv`); on 40 pages a factual lead paragraph + H2 at the top (built from each page's existing description/excerpt — no new claims) and a closing «related projects and services» paragraph with descriptive internal links to related projects/products, the matching service page and the contact page; on the 6 posts only the closing internal-links paragraph. A hidden marker `<!-- tp-seo:v1 -->` makes the operation idempotent. One link in the SHOMAAA English entry (`/en/` → `/en/home/`, a 301) was corrected afterwards.
All fields are unique (checked), Persian copy uses half-spaces, product/brand names, technologies and facts were preserved; no reviews, ratings, outcomes or client names were invented.

## 5. Yoast results — how they were verified (important)
Yoast stores its green/orange/red score only when a post is saved in the block editor, and I could not (and by policy must not) log into wp-admin with the password. I therefore did **not** read editor scores. Instead I ran the **official `yoastseo` 3.6 analysis library** (same SEO + readability assessors, with its Persian and English researchers) offline on the real post content and the real rendered Yoast title/description/canonical (`seo/analyze.cjs`; title pixel width measured in Chromium like Yoast does). Green ≥ 71, orange 41–70, red ≤ 40 on the 0–100 aggregate.
Calibration caveat: for the two items that had editor scores stored, the offline value differed slightly (e.g. id 125: stored 67 vs offline 64; id 128: stored 56 vs offline 86), so treat the numbers as a close estimate, **not as verified editor indicators**.

| Group | Before | After |
|---|---|---|
| SEO — green / orange / red / no keyphrase | 6 / 1 / 1 / 38 | **31 / 9 / 0 / 6** |
| Readability — green / orange / red | 38 / 7 / 1 | **41 / 4 / 1** |
| Verified green **in the Yoast editor** | 0 | 0 (not possible without admin login) |

## 6. Remaining issues → `seo-remaining-issues.md`
## 7. Other deliverables
`seo-url-inventory.csv`, `seo-changes.csv`, `sitemap-validation.md`, scripts in `seo/` (`export.php`, `analyze.cjs`, `fields.json`, `content-plan.cjs`, `make-ops.cjs`, `apply.php`, `rollback.php`, `sitemap-check.mjs`, `make-reports.py`).

## 8. Summary
- Audited: 12 products, 6 posts, 28 projects (+32 other URLs inventoried). Sitemap: valid, 214 URLs all 200 and canonical-consistent, robots points to it.
- Issues found and fixed: missing keyphrase (38), missing description (38), default titles (38), orphaned pages (24 of 30 got internal links), 6 placeholder pages noindexed, 1 redirecting link.
- Pages optimised: 46 (40 with content additions).
- Pages with verified green Yoast SEO: **0 verified in-editor**; 31/40 green by offline Yoast library. Readability green: 41/46 offline.
