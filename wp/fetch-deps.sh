#!/usr/bin/env bash
# Downloads third-party WordPress dependencies into wp/vendor (gitignored; not committed).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p vendor && cd vendor
curl -fsSL -o woocommerce.zip https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
curl -fsSL -o wp-cli.phar https://github.com/wp-cli/wp-cli/releases/download/v2.12.0/wp-cli-2.12.0.phar
echo "WooCommerce: $(unzip -p woocommerce.zip woocommerce/woocommerce.php | grep -m1 -E '^ \* Version:')"

# Persian translation packs (core + WooCommerce), baked into the image.
WPVER=$(docker run --rm wordpress:php8.3-apache sh -c "grep wp_version /usr/src/wordpress/wp-includes/version.php" | grep -oE "[0-9]+\.[0-9]+(\.[0-9]+)?" | head -1)
WCVER=$(unzip -p woocommerce.zip woocommerce/woocommerce.php | grep -m1 -E '^ \* Version:' | awk '{print $3}')
mkdir -p ../languages/plugins
curl -fsSL -o ../languages/fa_IR-core.zip "https://downloads.wordpress.org/translation/core/${WPVER}/fa_IR.zip" || echo "core fa_IR pack unavailable for ${WPVER}"
curl -fsSL -o ../languages/fa_IR-woocommerce.zip "https://downloads.wordpress.org/translation/plugin/woocommerce/${WCVER}/fa_IR.zip" || echo "woocommerce fa_IR pack unavailable for ${WCVER}"
echo "core=${WPVER} woocommerce=${WCVER}"
