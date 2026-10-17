#!/usr/bin/env bash
# Manual deployment (no CI/CD). Run from the repo root on a machine with Docker and VPN access to the server.
#   deploy/deploy.sh            # build both images, import to k3s, apply manifests, wait for rollouts
#   deploy/deploy.sh seed       # additionally run the idempotent WordPress/WooCommerce bootstrap + seed
set -euo pipefail
cd "$(dirname "$0")/.."
SSH_TARGET="${SSH_TARGET:-opsadmin@10.20.0.1}"
K="sudo k3s kubectl -n shomaaa"
SHA=$(git rev-parse --short HEAD)
DIRTY=$(git diff --quiet && git diff --cached --quiet || echo "-dirty")
WEB_TAG="${SHA}${DIRTY}"; WP_TAG="${SHA}${DIRTY}"

echo "==> building images ($WEB_TAG)"
wp/prepare-seed.sh
[ -f wp/vendor/woocommerce.zip ] || wp/fetch-deps.sh
docker build -q -t "shomaaa-local/wp:${WP_TAG}" wp
docker build -q -t "shomaaa-local/web:${WEB_TAG}" --build-arg NEXT_PUBLIC_SITE_URL=https://shomaaa.ir --build-arg WORDPRESS_URL=http://wordpress:80 .

echo "==> importing images into k3s containerd (node-local, same approach as tpsite-local/minio)"
for img in "shomaaa-local/wp:${WP_TAG}" "shomaaa-local/web:${WEB_TAG}"; do
  docker save "$img" | ssh "$SSH_TARGET" "sudo k3s ctr -n k8s.io images import -" >/dev/null
done

echo "==> applying manifests"
for f in deploy/k8s/*.yaml; do
  sed -e "s#__WP_TAG__#${WP_TAG}#g" -e "s#__WEB_TAG__#${WEB_TAG}#g" "$f" | ssh "$SSH_TARGET" "sudo k3s kubectl apply -f -"
done
ssh "$SSH_TARGET" "$K rollout status statefulset/mysql --timeout=300s && $K rollout status deploy/wordpress --timeout=300s && $K rollout status deploy/web --timeout=300s"

if [ "${1:-}" = "seed" ]; then
  echo "==> bootstrap + seed (idempotent)"
  ssh "$SSH_TARGET" "$K exec deploy/wordpress -- /opt/shomaaa/bootstrap.sh"

fi
echo "==> done: web=${WEB_TAG} wp=${WP_TAG}"
