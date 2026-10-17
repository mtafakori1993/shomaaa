# Infrastructure findings (inspected 2026-10-17, read-only)

Evidence gathered over `ssh opsadmin@10.20.0.1` and the public sites. No Qlean resource was modified; no secret values were read or recorded.

## What actually runs
| Aspect | Finding |
|---|---|
| Host | Single Ubuntu 24.04 VM (hostname `TafakorPardazan`), 16 vCPU / 23 GB, public IP `193.151.152.230` |
| Runtime | **k3s** (single node, v1.36) — not Docker/Compose on the host (Docker is not installed there) |
| Ingress / TLS | k3s **Traefik** (`kube-system`), hostPort 80/443 bound to the public IP only. HTTP→HTTPS permanent redirect. ACME **HTTP-01** resolvers `le` (prod) and `le-staging`, certs on a PVC (`/opt/infra/k3s/traefik-config.yaml`) |
| Routing | One `Ingress` (class `traefik`) per host, annotated `router.tls.certresolver: le`, `router.entrypoints: websecure`, `router.middlewares: <ns>-security-headers@kubernetescrd` |
| Namespaces | One per product: `qlean`, `tpsite`, `tpaccounting`, `tpcall`, `tpcall-turn`, `ci` |
| Qlean | `qleanapp.ir` is a WordPress Deployment (`wordpress`, 2 replicas) + MySQL StatefulSet; `app.`/`coworker.`/`admin.` hosts are separate nginx front-end Deployments behind an `api-gateway`. DNS for `qleanapp.ir` points directly at the public IP |
| Pattern details | Pods: `automountServiceAccountToken: false`, `seccompProfile: RuntimeDefault`, dropped capabilities, resource requests/limits, startup/readiness/liveness probes, rolling updates. DBs are headless StatefulSets on `local-path` PVCs; nightly `CronJob` mysqldump/pg_dump to a backup PVC (14 kept). `NetworkPolicy`: default-deny ingress + explicit allows (traefik → frontends, wordpress → mysql, jobs → db) |
| Secrets/config | Kubernetes `Secret`s (`qlean-secrets`, registry pull secrets) + `ConfigMap`s; k3s secrets-encryption is on |
| Images | Built by GitLab CI (runners tagged `build`/`deploy` in ns `ci`) and pushed to the GitLab registry `gitlab.tafakorpardazan.ir:5050` (VPN-only); a node-local image imported with `ctr` is also used (`tpsite-local/minio`) |
| Logging / restart | `restartPolicy: Always`; logs via `kubectl logs`; no centralised logging stack found |
| Access | SSH and GitLab are reachable only through WireGuard (`10.20.0.0/24`); UFW default-deny |
| GitLab | CE 19.4 Omnibus on the same host (VPN-only); SSH push as `root`; project namespace `tafakor-pardazan` |

## Reused pattern vs. not reused
Reused: namespace-per-product, Traefik Ingress + `le` resolver + security-headers middleware, StatefulSet MySQL with `local-path` PVC, backup CronJob, default-deny NetworkPolicies, hardened pod security, node-local image import.
Not reused: any Qlean image, credential, database, domain or config value.

## DNS finding for shomaaa.ir
At inspection time `shomaaa.ir` is delegated to **ArvanCloud** (`r.ns.arvancdn.ir`, `g.ns.arvancdn.ir`) and resolves to Arvan edge IPs (`185.143.233.132`, `185.143.234.132`), answering HTTP 404 from Arvan. The server's Traefik can only obtain a Let's Encrypt certificate (HTTP-01) once the A record points at `193.151.152.230` with the CDN proxy ("cloud") **disabled** (DNS-only), or if Arvan is configured with this server as origin and a certificate is provisioned there. DNS is managed externally; this was not changed.
