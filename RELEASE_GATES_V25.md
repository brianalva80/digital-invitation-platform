# Consolidated release gates — V25
**Local source handoff complete; all external gates below OPEN.** V20–V24 gate files are retained as detailed acceptance criteria, not superseded by a passing static test. Do not activate real customer data or real payments until all mandatory gates are resolved and owner authorizes production.

| Gate | Required evidence | Status |
|---|---|---|
| S0 dependencies/build | Patched compatible versions, lockfile, npm ci, semantic typecheck, Next build, local HTTP smoke, route tracing, no secret bundle | OPEN — dependencies unavailable |
| S1 DB | Execute 001–006 in chronological disposable staging with matching fixtures, inspect effective roles, 2 real accounts, constraints, concurrency, privileges and rollback | OPEN — no PostgreSQL/Supabase |
| S2 Auth and storage | Email confirm/reset/expiry/logout/account switch; native localStorage and cross-device cloud, revision conflicts; strict server draft validation (currently direct RPC permits structurally valid but invalid content), media magic bytes, object storage and signed URLs, upload quotas/cleanup, deletion/backups | OPEN |
| S2 Payment | Actual Midtrans sandbox webhook HTTPS and canonical status, fraud/pending/capture/settlement, duplicate, stale/refund/dispute/expired/404/timeout, recover stuck creating safely; reconcile and audit, one-order limitation, no duplicate charge, server pricing | OPEN |
| S3 Publish | Real five-theme renderer, paid-only and explicit consent, stable slug, CAS, publication deactivation, guest anonymity, private no-store, real CSP, links/maps/audio/mobile | OPEN |
| S3 Guests | CRUD/CSV, token rotation and stale pages, capacity and RSVP race, data isolation, rate limits and redaction, consent/retention, personalized links as bearer capabilities | OPEN |
| S3 Event | Real QR encode/decode, staff revoke, PIN attempts/expiry/rotation/all endpoints, concurrency check-in/draw, owner-only winners, export, mobile camera fallback, staff expiry and correction procedure | OPEN |
| S3 Planning | Five modules end-to-end, conflict recovery, save/restore, no cross-owner access, report privacy, actual timezone and money handling | OPEN |
| S3 Security & operations | Distributed rate limits, request limits, logging redaction including path tokens, CSP/XSS, Auth storage, service role isolation, audit and monitoring, backup/restore, deletion/privacy and incident handling | OPEN |
| S3 Performance & UAT | Physical iOS Safari/Android/desktop, motion/audio, keyboard/accessibility, load tests, Lighthouse and Core Web Vitals; approved design freeze only after user review | OPEN |
| S4 Commercial & launch | Pricing/tier/validity/renewal/refunds/quotas, domain and branding, consent/terms, media rights, WO sharing policy, production payment implementation and explicit authorization | OPEN |

Historical details: RELEASE_GATES_V20.md through RELEASE_GATES_V24.md. The V25 migration disables pre-PIN RPC execution by service_role; run its fixture and verify effective grants after migration. No external service was accessed or provisioned. V25 source fixes are not evidence of actual security or payment acceptance.
