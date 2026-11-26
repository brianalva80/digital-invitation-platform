# AMPLOP V25 — Master Application Package
Cumulative source candidate V17–V25 for the NEW Option B application. The inaccessible original ChatGPT Site is not modified. This is the final pre-Codex handoff, NOT a deployed or production-ready SaaS. No Codex, Work, service provisioning, real payments, or external database changes occurred during this preparation.

## Start here
1. Extract this ZIP into a new empty project directory (not the old site). Read `AGENTS.md`, `CODEX_START_HERE.txt`, `RELEASE_GATES_V25.md`, `DEPLOYMENT_RUNBOOK_V25.md` and `AUDIT_V25.md`.
2. Verify `MANIFEST_V25.sha256` from the project root (Linux/macOS/WSL: `sha256sum -c MANIFEST_V25.sha256` where available; macOS may use `shasum -a 256 -c MANIFEST_V25.sha256`). Older manifests are historical snapshots, not current verification targets. `reference/v16/MANIFEST.sha256` remains authoritative for immutable reference files.
3. `npm test` uses Node built-ins and actual renderer; `npm run verify:source` regenerates demos and checks syntax using TypeScript (local dependency or available global fallback). It does NOT typecheck semantically or build Next. Browser fixtures in `tests/review_*.py` require Python Playwright and Chromium. Run in a scratch copy because several scripts write screenshots/reports. Previous screenshots/reports are historical; current V25 logs live in `audit/v25/`.
4. For Codex: open the extracted folder, paste `CODEX_START_HERE.txt`. First scope is local dependency installation, lockfile, actual Next build/typecheck and smoke test. Do NOT connect live services or deploy. Subsequent staging requires explicit authorization.

## Application map
- `/` marketing and five templates; `/studio` preview; `/demo/studio-v14.html` local original editor; `/dashboard.html` offline demo; `/dashboard` redirects to `/account`.
- `/account` account, cloud draft, checkout/publication, guests, event controls, planning. Demo storage remains local; explicit cloud upload/restore. The offline dashboard's planned-module labels refer to the standalone demo, not cloud functionality.
- `/i/[slug]` generic paid publication (disabled in private mode); `/g/[token]` personal invitation, RSVP, PIN and ticket; `/g/[token]/invitation` sandboxed render; `/g/[token]/qr` QR image; `/check-in` restricted staff desk.
- `/api/health` liveness only; `/api/publishing`, `/api/midtrans/notification`, `/api/guests`, `/api/event`, `/api/event/staff`, `/api/planning` backend routes. Server functionality requires sandbox enablement. Auth uses Supabase.
- `supabase/migrations/` 001–006, 12 tables, ordered source. Do NOT apply V15 proposed scratch SQL under reference. See runbook for historical fixture ordering; pre-PIN RPCs revoked after 006.
- `reference/v16/` immutable source, V14 approved template reference, prior V15 proposal; `public/demo/` generated immutable editor + previews; `README_V18_ARCHIVE.md` through `README_V24_ARCHIVE.md` historical implementation details.

## Current evidence
82/82 Node tests; 284/284 Chromium fixture checks across six re-run suites (not live HTTP); 32 TypeScript and 28 JavaScript syntax checks; 9 generated files byte-identical on regeneration. No Next/React/Supabase/qrcode installed in current environment; no lockfile, no semantic typecheck, no Next build, no actual DB, Midtrans, camera or production tests. Do not equate local passing tests with production safety. See release gates.
