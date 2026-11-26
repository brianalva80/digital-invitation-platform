# V20 staging acceptance (not yet run)
- [ ] Review dependency versions and lockfile; npm install, npm test, typecheck, build.
- [ ] Apply V20 migration in disposable Supabase project; run v20_isolation.sql with ON_ERROR_STOP; verify ownership across two actual Auth users, anon denied, direct writes denied, workspace idempotent.
- [ ] Register with email confirmation; login with wrong/right password; reset via PKCE on initiating browser; invalid/expired callback; logout, reload, session expiry and account switching across tabs.
- [ ] Confirm actual draft save and restore on one origin for all five designs; native localStorage quotas, legacy migration, photo/audio fidelity, reload and cross-browser restore.
- [ ] Verify concurrent saves from two browser sessions: only one succeeds at same revision; losing session preserves local draft; lost network response recovery.
- [ ] Verify real PostgREST payload limits, strict backend schema validation and media byte validation before accepting real data; address direct RPC malformed own content.
- [ ] Test UI with keyboard, mobile, Safari, reduced motion; ensure auth and draft errors are visible and no sensitive content in logs.
- [ ] Review CSP and XSS, Auth session storage, private editor isolation, production asset object storage, signed URLs, cleanup and backup/privacy retention. Public demo must never receive actual customer data.
- [ ] No publishing/payments until separate sandbox verification and owner approval.
