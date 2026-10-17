#!/usr/bin/env bash
# One-time: creates the shomaaa-secrets Secret in the cluster with freshly generated random values.
# Values are written ONLY to the cluster and to a 0600 file outside the repo ($SECRETS_OUT). Never committed.
set -euo pipefail
SSH_TARGET="${SSH_TARGET:-opsadmin@10.20.0.1}"
SECRETS_OUT="${SECRETS_OUT:-$HOME/.shomaaa-prod-secrets}"
K="sudo k3s kubectl"
if ssh "$SSH_TARGET" "$K -n shomaaa get secret shomaaa-secrets" >/dev/null 2>&1; then echo "shomaaa-secrets already exists — not overwriting"; exit 0; fi
r() { openssl rand -base64 48 | tr -d '/+=\n' | cut -c1-"${1:-40}"; }
umask 077
{
  echo "MYSQL_ROOT_PASSWORD=$(r)"; echo "MYSQL_PASSWORD=$(r)"; echo "WP_ADMIN_PASSWORD=$(r 28)"; echo "REVALIDATE_SECRET=$(r)"
  for k in AUTH_KEY SECURE_AUTH_KEY LOGGED_IN_KEY NONCE_KEY AUTH_SALT SECURE_AUTH_SALT LOGGED_IN_SALT NONCE_SALT; do echo "WORDPRESS_$k=$(r 64)"; done
} > "$SECRETS_OUT"
args=$(sed 's/^\(.*\)=\(.*\)$/--from-literal=\1=\2/' "$SECRETS_OUT" | tr '\n' ' ')
ssh "$SSH_TARGET" "$K create namespace shomaaa --dry-run=client -o yaml | $K apply -f - >/dev/null; $K -n shomaaa create secret generic shomaaa-secrets $args"
echo "created; local copy at $SECRETS_OUT (mode 600)"
