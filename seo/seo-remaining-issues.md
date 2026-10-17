# Remaining issues and recommended next steps

## Content-limited Yoast warnings (not fixable without real information)
- **Text length < 300 words** on most project/product pages (60–230 words). Adding words without facts would be filler, so none was invented. Action: the owner supplies real details (problem, process, results the client approved, screenshots) per project.
- **9 pages still orange offline** (ids 31, 32, 53, 54, 124, 125, 178, 179, 181): short text, no images (Galatea, Zarix, Qlean product pages), no outbound link, keyphrase not in enough H2s.
- **Readability**: ids 212 (red; long sentences/transitions in the AI-assistant product text), 128, 214, 230, 56 orange (passive voice / transition words). 212/214 are long technical articles by the owner, rewriting them needs author review; 230 is my own English portfolio entry — can be polished next.
- **Image alt text** never contains the keyphrase (alt text is present everywhere in content: 0 images without alt). Product pages without images: Galatea AI, Zarix, Qlean (add illustrative images).
- **Title pixel width > 600** on 8 English/long Persian titles (ids 53, 176–179, 181, 183, 213): may be truncated in Google results; shorten if desired.

## Placeholder content (decision needed)
Projects 33, 34, 35 (fa) and 55, 56, 57 (en) are labelled «placeholder» in their own text. They are now `noindex` (reversible). Recommended: replace with real projects or unpublish. The `Zarix` product pages (32/54) also contain a «sample content» sentence.

## Cannibalisation / duplication to review
- Product pages (`tp_product`) and project pages (`tp_project`) describe the same things (TP Call, TP Accounting, AI assistant, Qlean). They now have different titles/keyphrases, but consider merging or canonicalising one type.
- Service «اتوماسیون کسب‌وکار» / «Business Automation» and the solution page with the same name share an identical SEO title (ids 24/27, 46/49).

## Not in scope of the three groups (inventory only)
- 27 pages/services/solutions have **no meta description** (`/`, about, contact, blog, services ×12, solutions ×12) and 20–70 words of body text; they are thin and are the site's main commercial pages. Highest-value next step: write real service pages with unique descriptions and keyphrases.
- Thin taxonomy archives in the sitemap (69 technology terms, 27 tags) — see `sitemap-validation.md`.

## Could not be done / verified
- Reading or recalculating Yoast's **editor** scores (needs wp-admin login, prohibited here). To confirm, open each page in the editor once (this also stores the scores), or ask for a dedicated Yoast-capable account/session.
- Structured data was sampled on two pages (WebPage/Article/BreadcrumbList/Organization graph from Yoast, valid JSON, no duplicates seen); Google's Rich Results tool was not run.
- Search-demand/competition data was not used (none available); keyphrases are realistic phrasings drawn from each page's content.
