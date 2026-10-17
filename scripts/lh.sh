#!/usr/bin/env bash
# Usage: scripts/lh.sh <url-path> <name> — mobile Lighthouse run against BASE (default http://localhost:3100)
cd "$(dirname "$0")/.."
CH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())")
mkdir -p generated/lh
NO_PROXY='*' no_proxy='*' CHROME_PATH=$CH npx lighthouse "${BASE:-http://localhost:3100}/$1" --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=generated/lh/$2.json --only-categories=performance,accessibility,best-practices,seo >/dev/null 2>&1
node -e "const r=require('./generated/lh/$2.json');const c=r.categories;console.log('$2',Object.entries(c).map(([k,v])=>k+':'+Math.round(v.score*100)).join(' '),'FCP',r.audits['first-contentful-paint'].displayValue,'LCP',r.audits['largest-contentful-paint'].displayValue,'CLS',r.audits['cumulative-layout-shift'].displayValue,'TBT',r.audits['total-blocking-time'].displayValue,'SI',r.audits['speed-index'].displayValue)"
