# V25 runbook — all external actions require explicit approval
## S0 Local build (first Codex session)
Use clean extracted directory. Verify manifest before edits; capture baseline in local git. Node >=20.9 per manifest, prefer supported patched LTS and verify Next requirements. Review patched dependency versions, install once; retain package-lock, use npm ci thereafter. Run source verifier, npm test, npm run typecheck, npm run build, then local smoke test with sandbox disabled. Use no live credentials. The current package has no lockfile because install was unavailable. Do not use `npm audit fix --force` or upgrade unrelated libraries blindly. No deployment.

## S1 Disposable Supabase (after approval)
Review grants, ownership and SQL with a database reviewer. In an empty disposable Supabase project, execute each migration with ON_ERROR_STOP=1, then matching rollback-only fixture as postgres, at its boundary. Use secured DB connection configuration outside repository; never log credentials. The six steps are:
| Migration | Immediately run fixture |
|---|---|
| 202611260001_amplop_v20.sql | v20_isolation.sql |
| 202611260002_amplop_v21.sql | v21_payment_publication.sql |
| 202611260003_amplop_v22.sql | v22_guests.sql |
| 202611260004_amplop_v23.sql | v23_event.sql |
| 202611260005_amplop_v24.sql | v24_planning.sql |
| 202611260006_amplop_v25.sql | v25_privileges.sql |
For example, in project root `psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611260001_amplop_v20.sql` then `psql -X -v ON_ERROR_STOP=1 -f supabase/tests/v20_isolation.sql` only after confirming the connection targets the disposable DB. Continue manually in order and stop on error. V21/V22 historical SQL fixtures intentionally invoke legacy RPCs under service_role; run before 006, not all against final schema. After 006, re-run V20/V23/V24/V25 compatible fixtures and test new PIN-aware endpoint paths in actual browser, plus parallel requests. SQL suites roll back test data but migrations persist. Do not reset production, never apply V15 scratch SQL. For failed disposable migration, inspect error; preserve evidence and use a fresh disposable project if needed. Do not drop production data.

## S2 Protected staging and payment sandbox (after approval)
Set environment values from .env.example in protected staging only. Public key must be publishable/anon, never service_role. Service role and Midtrans SB-Mid-server- key server-only; price explicit sandbox IDR; enable `AMPLOP_SANDBOX_ENABLED=true` only when authorized. Set Supabase Auth redirect allowlist for staging `/account` and recovery URL, email delivery and TLS. Use fictional data. Verify protected hosting plus narrowly reachable webhook, actual proxy origins, no secrets/guest tokens in access/APM logs. Do not use production payment endpoint or real funds. Sandbox is not production. Keep noindex/nofollow until separate public release approval. `outputFileTracingIncludes` must include trusted V14 bundle in deployed server output; test real render there.

## S3 Full end-to-end staging
Follow RELEASE_GATES_V25.md and original V20–V24 gates. Two separate accounts, real HTTP and SQL, payment provider sandbox, duplicate/race checks, private PIN and revoke, physical camera, mobile Safari/Android, native storage, accessibility and load/performance. Resolve security blockers before real data. Measure actual LCP/INP/CLS and response size; don't redesign to optimize without evidence. Capture reproducible logs without private content. Maintain rollback artifact and backups; database rollback must be designed and tested before production.

## S4 Production decision (separate approval)
No production integration is implemented or authorized here. Complete payment recovery/refunds/reconciliation, asset storage/validation, rate limits, audit and retention/deletion, business decisions, security review and UAT. Confirm provider live onboarding and legal/commercial policies. Only then propose production release plan. Do not switch sandbox URLs by string replacement and call it production-ready.
