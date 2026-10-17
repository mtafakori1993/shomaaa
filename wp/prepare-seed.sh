#!/usr/bin/env bash
# Copies the catalog JSON and generated product images into wp/seed for the image build.
set -euo pipefail
cd "$(dirname "$0")/.."
node catalog/build.mjs
cp catalog/products.json catalog/categories.json wp/seed/
rm -rf wp/seed/media && mkdir -p wp/seed/media/products
cp -r public/media/products/. wp/seed/media/products/
echo "seed prepared: $(find wp/seed/media -name '*.webp' | wc -l) images"
