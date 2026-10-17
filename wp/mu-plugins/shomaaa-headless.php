<?php
/**
 * Plugin Name: SHOMAAA headless
 * Description: Headless-storefront glue: health endpoint, Store API extension data (SEO/material/fit), hardening.
 */
defined('ABSPATH') || exit;

// ---- Never canonicalize-redirect: the storefront reaches WP through an internal hostname.
add_action('init', function () {
    remove_filter('template_redirect', 'redirect_canonical');
});

// ---- Behind the TLS-terminating proxy.
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// ---- Hardening
add_filter('xmlrpc_enabled', '__return_false');
add_filter('rest_endpoints', function ($endpoints) {
    if (!is_user_logged_in()) {
        unset($endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
});
add_action('wp_head', function () { echo '<meta name="robots" content="noindex,nofollow">' . "\n"; }, 1);
remove_action('wp_head', 'wp_generator');

// ---- Anything that is not admin/REST/login/cron goes to the storefront.
add_action('template_redirect', function () {
    $front = getenv('SHOMAAA_STOREFRONT_URL');
    if ($front && !is_admin() && !wp_doing_cron()) {
        wp_redirect(rtrim($front, '/') . '/', 302);
        exit;
    }
}, 1);

// ---- Health endpoint (DB + WooCommerce loaded)
add_action('rest_api_init', function () {
    register_rest_route('shomaaa/v1', '/health', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            global $wpdb;
            $db = (bool) $wpdb->get_var('SELECT 1');
            $woo = class_exists('WooCommerce');
            $status = ($db && $woo) ? 200 : 503;
            return new WP_REST_Response(['ok' => $db && $woo, 'db' => $db, 'woocommerce' => $woo], $status);
        },
    ]);
});

// ---- Store API extension: per-product SEO + spec fields.
add_action('woocommerce_blocks_loaded', function () {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) return;
    woocommerce_store_api_register_endpoint_data([
        'endpoint' => Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::IDENTIFIER,
        'namespace' => 'shomaaa',
        'data_callback' => function ($product) {
            $id = $product->get_id();
            return [
                'seo_title' => (string) get_post_meta($id, '_shm_seo_title', true),
                'seo_description' => (string) get_post_meta($id, '_shm_seo_description', true),
                'material' => (string) get_post_meta($id, '_shm_material', true),
                'fit' => (string) get_post_meta($id, '_shm_fit', true),
                'sample' => (bool) get_post_meta($id, '_shm_sample', true),
            ];
        },
        'schema_callback' => function () {
            return [
                'seo_title' => ['type' => 'string', 'readonly' => true],
                'seo_description' => ['type' => 'string', 'readonly' => true],
                'material' => ['type' => 'string', 'readonly' => true],
                'fit' => ['type' => 'string', 'readonly' => true],
                'sample' => ['type' => 'boolean', 'readonly' => true],
            ];
        },
        'schema_type' => ARRAY_A,
    ]);
});

// ---- Orders created through the demo storefront get a clear note.
add_action('woocommerce_store_api_checkout_order_processed', function ($order) {
    if (getenv('SHOMAAA_DEMO_MODE') === '1') {
        $order->add_order_note('سفارش از ویترین نمایشی ثبت شد؛ پرداخت واقعی انجام نشده است.');
        $order->update_meta_data('_shm_demo_order', 1);
        $order->save();
    }
});
