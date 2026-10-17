# WordPress + WooCommerce backend for the SHOMAAA headless storefront.
# Build context: wp/ (run wp/fetch-deps.sh first). Seed data is copied from the repo root via build context overlay.
FROM wordpress:php8.3-apache

RUN apt-get update && apt-get install -y --no-install-recommends unzip less default-mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod headers expires

COPY vendor/wp-cli.phar /usr/local/bin/wp
RUN chmod +x /usr/local/bin/wp

# Plugins/mu-plugins live in the image (immutable); only wp-content/uploads is a volume.
COPY vendor/woocommerce.zip /tmp/woocommerce.zip
RUN unzip -q /tmp/woocommerce.zip -d /usr/src/wordpress/wp-content/plugins && rm /tmp/woocommerce.zip
COPY languages/ /tmp/lang/
RUN mkdir -p /usr/src/wordpress/wp-content/languages/plugins \
    && unzip -qo /tmp/lang/fa_IR-core.zip -d /usr/src/wordpress/wp-content/languages \
    && unzip -qo /tmp/lang/fa_IR-woocommerce.zip -d /usr/src/wordpress/wp-content/languages/plugins \
    && rm -rf /tmp/lang
COPY mu-plugins/ /usr/src/wordpress/wp-content/mu-plugins/
COPY php.ini /usr/local/etc/php/conf.d/zz-shomaaa.ini
COPY htaccess /usr/src/wordpress/.htaccess
COPY healthz-live.txt /usr/src/wordpress/healthz-live.txt

# Seed assets (catalog JSON + generated images) used by bootstrap.sh
COPY seed/ /opt/shomaaa/seed/
COPY bootstrap.sh /opt/shomaaa/bootstrap.sh
RUN chmod +x /opt/shomaaa/bootstrap.sh \
    && chown -R www-data:www-data /usr/src/wordpress/wp-content
