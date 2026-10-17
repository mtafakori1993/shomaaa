<?php
// Restores content + Yoast meta of every audited post from seo/data/snapshot-before.json (pre-change state).
// Usage: copy snapshot to /tmp/snapshot-before.json inside the pod, then: php /tmp/rollback.php [--dry]
define('WP_USE_THEMES', false);
$_SERVER['HTTP_HOST'] = 'tafakorpardazan.ir'; $_SERVER['HTTPS'] = 'on';
require '/var/www/html/wp-load.php';
wp_set_current_user(1);
$dry = in_array('--dry', $argv, true);
$ops = json_decode(file_get_contents('/tmp/ops.json'), true); // same id list as apply
$ids = array_column($ops, 'id');
$snap = json_decode(file_get_contents('/tmp/snapshot-before.json'), true);
foreach ($snap as $s) {
    if (!in_array($s['id'], $ids, true) && $s['id'] != 230) continue;
    $map = ['_yoast_wpseo_title' => $s['seo_title_meta'], '_yoast_wpseo_metadesc' => $s['metadesc_meta'], '_yoast_wpseo_focuskw' => $s['focuskw'], '_yoast_wpseo_meta-robots-noindex' => $s['noindex_meta']];
    if ($dry) { echo "DRY {$s['id']}\n"; continue; }
    foreach ($map as $k => $v) { if ($v === '') delete_post_meta($s['id'], $k); else update_post_meta($s['id'], $k, $v); }
    $r = wp_update_post(['ID' => $s['id'], 'post_content' => wp_slash($s['content'])], true);
    echo (is_wp_error($r) ? 'ERR ' : 'OK  ') . $s['id'] . "\n";
}
