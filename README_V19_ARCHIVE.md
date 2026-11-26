# AMPLOP V19 — Customer Dashboard

Independent application, continuing V18. No Codex/Work, deployment, real accounts, or payment actions. V14 and V16 archive are unchanged. V19 introduces one local demo wedding workspace, not a multi-tenant customer account.

## Run the prototype
Extract the full ZIP. For reliable shared local storage use one HTTP origin. Without npm, run from the extracted root:
```sh
python -m http.server 8000 --bind 127.0.0.1 --directory public
```
Open `http://127.0.0.1:8000/landing-preview.html` and choose Create your invitation, or open `/dashboard.html` directly. Opening `public/dashboard.html` as a file is also possible in compatible browsers, but file-origin storage is not portable; prefer HTTP. Use fictional data only. After editing in Studio, click Simpan draft and return using browser Back or the workspace tab. Do not edit the same draft concurrently.

When npm dependencies are available, use Node >=20.9 (supported LTS recommended), `npm install`, `npm test`, `npm run typecheck`, `npm run build`, `npm run dev`. Verify compatible patched versions and retain the first verified package-lock.json; use npm ci thereafter. No new dependencies or secrets added.

| Route | Purpose |
| --- | --- |
| `/` | V18 landing page, CTA now points to `/dashboard` |
| `/dashboard` | Next route redirects to same-origin `/dashboard.html` |
| `/dashboard.html` | Actual native HTML/CSS/JS workspace, shared by Next and static preview |
| `/landing-preview.html` | Static V18 visual snapshot with updated CTA |
| `/studio` | V17 entry point with workspace link |
| `/demo/studio-v14.html` | Byte-identical original editor |
| `/demo/templates/<template-id>.html` | Five original invitation demos |
| `/api/health` | Liveness only |

## Architecture and scope
- Dashboard deliberately uses native HTML/CSS/JS served from public rather than duplicating renderer/editor logic in React; migration to authenticated React pages can be considered in V20. `scripts/sync-dashboard.mjs` copies the exact V14 engine + typography and extracts the trusted bundle from the archived Studio HTML. No new renderer. Regenerated in prepare:demo. No third-party assets or dependencies.
- Dashboard reads V14 storage key `amplop:studio:v12:draft`, legacy fallback `amplop:studio:v11:draft`. No silent writes when opening demo. Selecting a design saves the entire existing draft with only `slug` changed. Storage errors and malformed primary drafts block changes rather than overwriting. Storage is not transactional; concurrent editing is unsupported. This is not the V15 canonical server schema; migrate through a validated adapter later.
- Actual preview uses Engine.render with the stored data, settings, uploads and experience, in sandboxed iframe without allow-same-origin; iframe is destroyed on close. Demo RSVP is not transmitted, storage in sandbox may be unavailable. Music follows stored settings. Cover images are examples, not personalized screenshots. Default data is fictional. No native cross-tab guarantees.
- Overview includes wedding date/countdown (WIB), local draft state, selected design, five selectable templates and links to editor; publishing is explicitly disabled. Guest, Wedding Day, Planner, Budget and Vendor cards are roadmap information, not functioning modules. V20 will address authentication/database. V21+ modules not implemented.
- `npm test` includes foundation, showcase and dashboard assertions. `node scripts/review-landing.mjs` regenerates static landing snapshot; `node scripts/sync-dashboard.mjs` regenerates renderer assets; `python tests/review_dashboard.py` requires Playwright + Chromium, tests actual browser scripts in memory with simulated storage and embedded image assets. See TEST_REPORT_V19.txt and DASHBOARD_BROWSER_REPORT.json.
- Preserve `reference/v16/` and original V14 studio. V18 documentation archived in README_V18_ARCHIVE.md. Previous screenshots/tests are historical, not current runtime evidence.

## Release gates
Native HTTP/file navigation blocked in current environment; browser QA used set_content and fixture transfer, not real native localStorage integration. Next installation/build/typecheck and routing, native cross-page storage, browser quotas and races, Safari/physical devices, Lighthouse, production security remain unverified. Do not deploy personal data or enable payments. No live database or auth. V19 source/local prototype is ready for review, not production. Next authorized milestone: V20.
