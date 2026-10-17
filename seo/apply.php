<?php
// Applies seo/data/ops.json through WordPress APIs (wp_update_post + meta_input so Yoast re-indexes on save).
// kubectl exec -i deploy/wordpress -- php /tmp/apply.php [--dry]
define('WP_USE_THEMES', false);
$_SERVER['HTTP_HOST'] = 'tafakorpardazan.ir'; $_SERVER['HTTPS'] = 'on';
require '/var/www/html/wp-load.php';
wp_set_current_user(1);
$dry = in_array('--dry', $argv, true);
$ops = json_decode(file_get_contents('/tmp/ops.json'), true);
$ok = 0; $skip = 0; $err = 0;
foreach ($ops as $o) {
    $p = get_post($o['id']);
    if (!$p || $p->post_status !== 'publish') { echo "SKIP {$o['id']} not published\n"; $skip++; continue; }
    if (sha1($p->post_content) !== $o['before_sha1'] && strpos($p->post_content, 'tp-seo:v1') === false) { echo "SKIP {$o['id']} content changed since snapshot\n"; $skip++; continue; }
    $args = ['ID' => $o['id'], 'meta_input' => $o['meta']];
    if ($o['content'] && strpos($p->post_content, 'tp-seo:v1') === false) $args['post_content'] = wp_slash($o['content']);
    if ($dry) { echo "DRY {$o['id']} meta=" . count($o['meta']) . " content=" . (isset($args['post_content']) ? 'yes' : 'no') . "\n"; continue; }
    $r = wp_update_post($args, true);
    if (is_wp_error($r)) { echo "ERR {$o['id']} " . $r->get_error_message() . "\n"; $err++; } else { echo "OK  {$o['id']}\n"; $ok++; }
}
echo "done ok=$ok skip=$skip err=$err dry=" . ($dry ? 1 : 0) . "\n";
