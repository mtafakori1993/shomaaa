<?php
/**
 * Seeds the 30 illustrative sample products. Idempotent: existing products (matched by SKU) are updated,
 * never duplicated. Run via `wp eval-file` AFTER seed-structure.php (attribute taxonomies must be registered).
 */
if (!defined('ABSPATH')) exit;
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
add_filter('intermediate_image_sizes_advanced', '__return_empty_array'); // storefront resizes via next/image

$seed = '/opt/shomaaa/seed';
$products = json_decode(file_get_contents("$seed/products.json"), true);

function shm_term($name, $tax, $slug, $order = null) {
    $t = get_term_by('slug', $slug, $tax);
    if (!$t) { $r = wp_insert_term($name, $tax, ['slug' => $slug]); if (is_wp_error($r)) { WP_CLI::warning($r->get_error_message()); return 0; } $id = $r['term_id']; }
    else { $id = $t->term_id; if ($t->name !== $name) wp_update_term($id, $tax, ['name' => $name]); }
    if ($order !== null) update_term_meta($id, 'order_' . $tax, $order);
    return $id;
}
function shm_en_digits($s) { return strtr($s, ['۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']); }

function shm_attach($rel, $alt, $parent) {
    $path = "/opt/shomaaa/seed/media/$rel";
    if (!file_exists($path)) return 0;
    $hash = md5_file($path);
    $found = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => 1, 'meta_key' => '_shm_src', 'meta_value' => $rel]);
    if ($found) {
        $id = $found[0]->ID;
        if (get_post_meta($id, '_shm_hash', true) === $hash) { update_post_meta($id, '_wp_attachment_image_alt', $alt); return $id; }
        wp_delete_attachment($id, true);
    }
    $tmp = wp_tempnam($rel); copy($path, $tmp);
    $id = media_handle_sideload(['name' => str_replace('/', '-', preg_replace('#^products/#', '', $rel)), 'tmp_name' => $tmp], $parent, null);
    if (is_wp_error($id)) { WP_CLI::warning("$rel: " . $id->get_error_message()); @unlink($tmp); return 0; }
    update_post_meta($id, '_shm_src', $rel); update_post_meta($id, '_shm_hash', $hash);
    update_post_meta($id, '_wp_attachment_image_alt', $alt);
    return $id;
}

$created = 0; $updated = 0;
foreach ($products as $p) {
    $hasSize = count($p['sizes']) > 0;
    $hasColorVar = count($p['colors']) > 1;
    $variable = $hasSize || $hasColorVar;

    $id = wc_get_product_id_by_sku($p['sku']);
    if ($id) { $product = wc_get_product($id); $updated++; }
    else { $product = $variable ? new WC_Product_Variable() : new WC_Product_Simple(); $created++; }

    $cat = get_term_by('slug', $p['cat'], 'product_cat');
    $tagIds = array_map(fn($t) => shm_term($t, 'product_tag', 'tag-' . md5($t)), array_merge($p['tags'], ['نمونه آزمایشی']));

    $product->set_name($p['name']);
    $product->set_slug($p['slug']);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_short_description($p['short']);
    $product->set_description($p['long']);
    $product->set_sku($p['sku']);
    $product->set_category_ids([$cat->term_id]);
    $product->set_tag_ids($tagIds);
    $product->set_reviews_allowed(false);
    if (!$variable) {
        $product->set_regular_price((string) $p['price']);
        $product->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : '');
        $product->set_manage_stock(true);
        $product->set_stock_quantity(8 + (crc32($p['sku']) % 25));
        $product->set_stock_status('instock');
    }

    // Attributes
    $attrs = [];
    $pos = 0;
    if ($hasSize) {
        $termIds = [];
        foreach ($p['sizes'] as $s) $termIds[] = shm_term($s, 'pa_size', 'size-' . shm_en_digits($s), (int) shm_en_digits($s));
        $a = new WC_Product_Attribute(); $a->set_id(wc_attribute_taxonomy_id_by_name('size')); $a->set_name('pa_size');
        $a->set_options($termIds); $a->set_position($pos++); $a->set_visible(true); $a->set_variation(true); $attrs[] = $a;
    }
    $cTermIds = [];
    foreach ($p['colors'] as $i => $c) $cTermIds[] = shm_term($c['name'], 'pa_color', 'color-' . $c['id'], $i);
    $a = new WC_Product_Attribute(); $a->set_id(wc_attribute_taxonomy_id_by_name('color')); $a->set_name('pa_color');
    $a->set_options($cTermIds); $a->set_position($pos++); $a->set_visible(true); $a->set_variation($hasColorVar); $attrs[] = $a;
    foreach ([['جنس', $p['material']], ['برش', $p['fit']]] as [$n, $v]) {
        if ($v === '—') continue;
        $a = new WC_Product_Attribute(); $a->set_id(0); $a->set_name($n); $a->set_options([$v]);
        $a->set_position($pos++); $a->set_visible(true); $a->set_variation(false); $attrs[] = $a;
    }
    $product->set_attributes($attrs);
    if ($variable) { $product->set_regular_price((string) $p['price']); $product->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : ''); }

    $pid = $product->save();

    // Images
    $alt = $p['name'] . ' — تصویر نمونه';
    $main = shm_attach("products/{$p['slug']}/main.webp", $alt, $pid);
    $gal = [];
    for ($g = 1; $g <= $p['gallery']; $g++) { $gid = shm_attach("products/{$p['slug']}/gallery-$g.webp", "$alt (جزئیات $g)", $pid); if ($gid) $gal[] = $gid; }
    $product = wc_get_product($pid);
    if ($main) $product->set_image_id($main);
    $product->set_gallery_image_ids($gal);
    $product->save();

    // Meta used by the headless extension
    update_post_meta($pid, '_shm_seo_title', $p['seoTitle']);
    update_post_meta($pid, '_shm_seo_description', $p['seoDescription']);
    update_post_meta($pid, '_shm_material', $p['material']);
    update_post_meta($pid, '_shm_fit', $p['fit'] === '—' ? '' : $p['fit']);
    update_post_meta($pid, '_shm_sample', 1);

    // Variations
    if ($variable) {
        $sizesAxis = $hasSize ? $p['sizes'] : [null];
        $colorsAxis = $hasColorVar ? $p['colors'] : [null];
        $existing = [];
        foreach ($product->get_children() as $vid) { $v = wc_get_product($vid); if ($v) $existing[json_encode($v->get_attributes())] = $v; }
        $inStock = 0; $combos = [];
        foreach ($sizesAxis as $s) foreach ($colorsAxis as $ci => $c) $combos[] = [$s, $c, $ci];
        foreach ($combos as $k => [$s, $c, $ci]) {
            $va = [];
            if ($s !== null) $va['pa_size'] = 'size-' . shm_en_digits($s);
            if ($c !== null) $va['pa_color'] = 'color-' . $c['id'];
            $key = json_encode($va);
            $var = $existing[$key] ?? new WC_Product_Variation();
            $var->set_parent_id($pid);
            $var->set_attributes($va);
            $var->set_sku($p['sku'] . ($s !== null ? '-' . shm_en_digits($s) : '') . ($c !== null ? '-' . strtoupper(substr($c['id'], 0, 3)) : ''));
            $var->set_regular_price((string) $p['price']);
            $var->set_sale_price($p['salePrice'] ? (string) $p['salePrice'] : '');
            $var->set_manage_stock(true);
            $h = crc32($p['sku'] . $key);
            $qty = ($h % 13 === 0 && $k > 0) ? 0 : 2 + ($h % 11);   // a few sold-out combinations for realism
            $var->set_stock_quantity($qty);
            $var->set_stock_status($qty > 0 ? 'instock' : 'outofstock');
            if ($c !== null && $ci > 0 && $p['variantImages']) {
                $vi = shm_attach("products/{$p['slug']}/color-{$c['id']}.webp", $alt . ' — ' . $c['name'], $pid);
                if ($vi) $var->set_image_id($vi);
            }
            $var->save();
        }
        $product = wc_get_product($pid);
        WC_Product_Variable::sync($pid);
    }
    WP_CLI::log(($id ? 'updated ' : 'created ') . $p['sku'] . ' ' . $p['slug']);
}
WP_CLI::success("products ok: created=$created updated=$updated");
