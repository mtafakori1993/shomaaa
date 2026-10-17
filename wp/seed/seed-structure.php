<?php
/**
 * Store structure: settings, categories, global attributes, shipping, payment, coupon.
 * Idempotent: safe to rerun. Run via `wp eval-file`.
 */
if (!defined('ABSPATH')) exit;
$seed = '/opt/shomaaa/seed';
$demo = getenv('SHOMAAA_DEMO_MODE') === '1';

// ---- Core + WooCommerce settings
update_option('blogname', 'شوما');
update_option('blogdescription', 'پوشاک رسمی مردانه و زنانه');
update_option('timezone_string', 'Asia/Tehran');
update_option('permalink_structure', '/%postname%/');
update_option('default_comment_status', 'closed');
$wc = [
  'woocommerce_currency' => 'IRT',
  'woocommerce_price_num_decimals' => '0',
  'woocommerce_price_thousand_sep' => ',',
  'woocommerce_price_decimal_sep' => '.',
  'woocommerce_currency_pos' => 'right_space',
  'woocommerce_default_country' => 'IR:THR',
  'woocommerce_allowed_countries' => 'specific',
  'woocommerce_specific_allowed_countries' => ['IR'],
  'woocommerce_ship_to_countries' => 'specific',
  'woocommerce_specific_ship_to_countries' => ['IR'],
  'woocommerce_store_address' => 'تهران',
  'woocommerce_store_city' => 'تهران',
  'woocommerce_calc_taxes' => 'no',
  'woocommerce_enable_guest_checkout' => 'yes',
  'woocommerce_enable_signup_and_login_from_checkout' => 'no',
  'woocommerce_enable_coupons' => 'yes',
  'woocommerce_enable_reviews' => 'no',
  'woocommerce_manage_stock' => 'yes',
  'woocommerce_hold_stock_minutes' => '60',
  'woocommerce_allow_tracking' => 'no',
  'woocommerce_show_marketplace_suggestions' => 'no',
  'woocommerce_task_list_hidden' => 'yes',
  'woocommerce_onboarding_opt_in' => 'no',
  'woocommerce_coming_soon' => 'no',
  'woocommerce_store_pages_only' => 'no',
  'woocommerce_default_customer_address' => 'base',
];
foreach ($wc as $k => $v) update_option($k, $v);

// ---- Categories (parents first)
$cats = json_decode(file_get_contents("$seed/categories.json"), true);
$ids = [];
foreach ($cats as $c) {
    $parent = $c['parent'] ? ($ids[$c['parent']] ?? 0) : 0;
    $t = get_term_by('slug', $c['slug'], 'product_cat');
    $args = ['slug' => $c['slug'], 'description' => $c['description'], 'parent' => $parent];
    if ($t) { wp_update_term($t->term_id, 'product_cat', $args + ['name' => $c['name']]); $ids[$c['slug']] = $t->term_id; }
    else { $r = wp_insert_term($c['name'], 'product_cat', $args); $ids[$c['slug']] = is_wp_error($r) ? 0 : $r['term_id']; }
}
$default = get_term_by('slug', 'uncategorized', 'product_cat');
if ($default) wp_update_term($default->term_id, 'product_cat', ['name' => 'دسته‌بندی‌نشده', 'slug' => 'uncategorized']);

// ---- Global attributes (terms are added by seed-products.php, after the taxonomies are registered)
foreach (['size' => 'سایز', 'color' => 'رنگ'] as $slug => $label) {
    if (!wc_attribute_taxonomy_id_by_name($slug)) {
        $r = wc_create_attribute(['name' => $label, 'slug' => $slug, 'type' => 'select', 'order_by' => 'menu_order', 'has_archives' => false]);
        if (is_wp_error($r)) WP_CLI::warning($r->get_error_message());
    }
}

// ---- Shipping: one zone (Iran) with flat rate + free shipping above a threshold
$zone = null;
foreach (WC_Shipping_Zones::get_zones() as $z) if ($z['zone_name'] === 'ایران') $zone = new WC_Shipping_Zone($z['id']);
if (!$zone) {
    $zone = new WC_Shipping_Zone(); $zone->set_zone_name('ایران'); $zone->set_zone_order(0);
    $zone->add_location('IR', 'country'); $zone->save();
}
$have = array_map(fn($m) => $m->id, $zone->get_shipping_methods());
if (!in_array('flat_rate', $have, true)) {
    $i = $zone->add_shipping_method('flat_rate');
    update_option("woocommerce_flat_rate_{$i}_settings", ['title' => 'ارسال با پیک یا پست پیشتاز', 'tax_status' => 'none', 'cost' => '180000', 'type' => 'class']);
}
if (!in_array('free_shipping', $have, true)) {
    $i = $zone->add_shipping_method('free_shipping');
    update_option("woocommerce_free_shipping_{$i}_settings", ['title' => 'ارسال رایگان', 'requires' => 'min_amount', 'min_amount' => '15000000', 'ignore_discounts' => 'no']);
}

// ---- Payment. No real gateway is configured; the demo gateway records an order WITHOUT charging anyone.
update_option('woocommerce_cod_settings', [
  'enabled' => $demo ? 'yes' : 'no',
  'title' => 'پرداخت آزمایشی (بدون برداشت وجه)',
  'description' => 'فروشگاه در حالت نمایشی است؛ سفارش ثبت می‌شود اما هیچ مبلغی از شما برداشت نمی‌شود.',
  'instructions' => 'این سفارش آزمایشی است و پرداخت واقعی انجام نشده است.',
  'enable_for_methods' => [], 'enable_for_virtual' => 'yes',
]);

// ---- Sample coupon (clearly labelled)
if (!wc_get_coupon_id_by_code('WELCOME10')) {
    $cp = new WC_Coupon(); $cp->set_code('WELCOME10'); $cp->set_discount_type('percent'); $cp->set_amount(10);
    $cp->set_description('کد تخفیف نمونه برای ویترین نمایشی'); $cp->set_usage_limit_per_user(0); $cp->save();
}
WP_CLI::success('structure ok');
