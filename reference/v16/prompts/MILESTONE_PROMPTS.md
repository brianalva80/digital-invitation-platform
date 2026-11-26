# Copy only one prompt per approved milestone
Read AGENTS.md and MASTER_IMPLEMENTATION_PLAN.md before executing. Attach last audit/evidence report. Each prompt inherits scope, safety, testing, and stop rules. M0 uses START_HERE_CODEX.txt.

## M1 — baseline
Execute M1 only following approved M0. Verify repo identity and dirty state, create approved branch/checkpoint without overwriting existing work, reproduce baseline using existing tooling, run package verifier in reference folder and document build/test commands/results. Use scratch QA runner only if compatible. No changes to product code, no deployment. Stop and report.

## M2 — design integration
Execute M2 only. Use V14 actual source, V15 data contract and ADAPTER_CONTRACT.md. Port shared renderer and editor minimally within existing framework. Preserve five distinct signatures, all existing compatible functions, user data on switch, photo replacement, local font presets and music upload/preview/compact playback. Do not build auth/payment/backend in this slice. Add adapter tests and fixture parity, run applicable full regressions and animation tests; record screenshots and failures. Stop and report.

## M3 — visual staging
Execute M3 only on approved isolated staging. No live data. Install only agreed licensed webfonts, preserve fallback and capture exact license and hash. Deploy reference integration to approved preview host, verify native storage/reload, browser matrix, audio formats, full motion and reduced motion, touch, accessibility and Lighthouse. Collect actual evidence and device tests requiring owner. Do not assert design freeze without owner approval. Stop.

## M4 — auth and cloud drafts
Execute M4 only after architecture and migration review. Implement wedding workspace, explicit server auth/authorization, draft optimistic revisions, private previews and validated asset processing. Use disposable staging DB; do not run draft SQL blindly. Test tenant isolation, draft conflict, storage ownership, media limits and rollback. No live payments or public publish. Stop.

## M5 — sandbox publishing
Execute M5 only. Confirm sandbox provider config and entitlement policy; no live charges. Implement order idempotency, verified webhook/canonical status, immutable snapshots and atomic active pointer, server paywall, stable slug and apply/unpublish. Verify malicious, duplicate and out-of-order callback tests and transactional rollback. Stop.

## M6 — guests and admin
Execute M6 only. Add guest management, opaque token exchange, scoped session, RSVP, least privilege admin and audit. Keep tokens out of logs and analytics, enforce party counts and deadline. Run V15 guest/security/restore checks. Public guestbook not silently included. Stop.

## M7 — SaaS release candidate
Execute M7 only. Run all applicable staging acceptance tests against exact candidate commit, review risks, evidence, performance, security, accessibility, devices, fonts, media and restore. Report every blocked test. Prepare owner approval checklist. No live production release or payments without explicit authorization. Stop.

## M8 / M9 — later phases
Only after MVP approval and separate feature spec: M8 QR, private PIN, lucky wheel, CSV; M9 planner, budgeting, vendor, rundown. Review product decisions and add schema/API/tests for each. Do not begin automatically.
