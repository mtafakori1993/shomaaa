#!/usr/bin/env bash
# Idempotent bootstrap: installs WordPress, activates WooCommerce, applies store structure and seeds the sample catalog.
# Run inside the wordpress container:  /opt/shomaaa/bootstrap.sh
set -euo pipefail
WP="wp --allow-root --path=/var/www/html"
: "${SITE_URL:?SITE_URL required}" "${WP_ADMIN_USER:?}" "${WP_ADMIN_PASSWORD:?}" "${WP_ADMIN_EMAIL:?}"

for i in $(seq 1 60); do $WP db check >/dev/null 2>&1 && break; sleep 3; done

if ! $WP core is-installed 2>/dev/null; then
  $WP core install --url="$SITE_URL" --title="شوما" --admin_user="$WP_ADMIN_USER" \
    --admin_password="$WP_ADMIN_PASSWORD" --admin_email="$WP_ADMIN_EMAIL" --skip-email
fi
$WP option update home "$SITE_URL" >/dev/null
$WP option update siteurl "$SITE_URL" >/dev/null
$WP language core activate fa_IR 2>/dev/null || $WP option update WPLANG fa_IR >/dev/null
$WP plugin is-active woocommerce || $WP plugin activate woocommerce
$WP rewrite structure '/%postname%/' >/dev/null 2>&1 || true
$WP eval-file /opt/shomaaa/seed/seed-structure.php
$WP eval-file /opt/shomaaa/seed/seed-products.php
$WP wc tool run install_pages --user="$WP_ADMIN_USER" >/dev/null 2>&1 || true
chown -R www-data:www-data /var/www/html/wp-content/uploads 2>/dev/null || true
$WP cache flush >/dev/null 2>&1 || true
echo "products (published): $($WP post list --post_type=product --post_status=publish --format=count)"
