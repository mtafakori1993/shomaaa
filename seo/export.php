<?php
// READ-ONLY inventory export. Run: kubectl exec -i deploy/wordpress -- php < seo/export.php
define('WP_USE_THEMES', false);
$_SERVER['HTTP_HOST'] = 'tafakorpardazan.ir'; $_SERVER['HTTPS'] = 'on';
require '/var/www/html/wp-load.php';
$types = ['tp_product', 'post', 'tp_project', 'tp_service', 'tp_solution', 'page'];
$out = [];
$host = 'tafakorpardazan.ir';
foreach ($types as $t) {
  $q = new WP_Query(['post_type' => $t, 'post_status' => 'publish', 'posts_per_page' => -1, 'lang' => '', 'orderby' => 'ID', 'order' => 'ASC', 'no_found_rows' => true]);
  foreach ($q->posts as $p) {
    $id = $p->ID;
    $m = fn($k) => (string) get_post_meta($id, $k, true);
    $content = $p->post_content;
    $text = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(do_blocks($content))));
    preg_match_all('/<a\s[^>]*href=["\']([^"\']+)["\']/i', $content, $am);
    $int = 0; $ext = 0; foreach ($am[1] as $h) { if (strpos($h, 'http') !== 0 || strpos($h, $host) !== false) $int++; else $ext++; }
    preg_match_all('/<img\b[^>]*>/i', $content, $im);
    $imgs = count($im[0]); $noalt = 0; foreach ($im[0] as $tag) { if (!preg_match('/\balt=["\'][^"\']+["\']/i', $tag)) $noalt++; }
    preg_match_all('/<h([1-6])\b/i', $content, $hm);
    $meta = YoastSEO()->meta->for_post($id);
    $thumb = get_post_thumbnail_id($id);
    $out[] = [
      'id' => $id, 'type' => $t, 'lang' => function_exists('pll_get_post_language') ? pll_get_post_language($id) : null,
      'title' => $p->post_title, 'slug' => $p->post_name, 'permalink' => get_permalink($id), 'modified' => $p->post_modified_gmt,
      'excerpt' => $p->post_excerpt,
      'focuskw' => $m('_yoast_wpseo_focuskw'), 'seo_title_meta' => $m('_yoast_wpseo_title'), 'metadesc_meta' => $m('_yoast_wpseo_metadesc'),
      'canonical_meta' => $m('_yoast_wpseo_canonical'), 'noindex_meta' => $m('_yoast_wpseo_meta-robots-noindex'),
      'linkdex' => $m('_yoast_wpseo_linkdex'), 'content_score' => $m('_yoast_wpseo_content_score'),
      'seo_title_rendered' => $meta->title, 'metadesc_rendered' => $meta->description, 'canonical_rendered' => $meta->canonical,
      'robots' => $meta->robots, 'schema_type' => $meta->schema_page_type ?? null,
      'words' => preg_match_all('/\S+/u', $text), 'chars' => mb_strlen($text),
      'internal_links' => $int, 'external_links' => $ext, 'content_imgs' => $imgs, 'content_imgs_noalt' => $noalt,
      'featured_id' => $thumb ?: null, 'featured_alt' => $thumb ? (string) get_post_meta($thumb, '_wp_attachment_image_alt', true) : null,
      'headings' => $hm[1], 'has_h1_in_content' => in_array('1', $hm[1], true),
      'translations' => function_exists('pll_get_post_translations') ? pll_get_post_translations($id) : null,
      'content_sha1' => sha1($content), 'content' => $content, 'post_name' => $p->post_name,
    ];
  }
}
echo json_encode($out, JSON_UNESCAPED_UNICODE);
