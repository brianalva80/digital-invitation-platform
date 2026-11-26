# AMPLOP V18 — Landing Page & Template Showcase
New independent application (Option B). Next.js App Router + TypeScript + npm; original V14 editor preserved as an exact static reference. No Codex/Work, old site changes, repository provisioning, deployment or database actions.

## Run locally (when dependencies available)
Node.js >=20.9 (prefer supported LTS), npm. From this directory:
```sh
npm install
npm run test
npm run typecheck
npm run build
npm run dev
```
Open the local server address printed by Next.js. After first verified install, retain the generated package-lock.json and use `npm ci`. Version ranges are provisional; resolve current patched releases in the selected major lines, review advisories before deployment. No environment variables needed for V18. No backend integration yet.

| Route | Purpose |
| --- | --- |
| `/` | Editorial marketing landing page (demo-only CTA) |
| `/demo/templates/<template-id>.html` | Five individually playable V14-generated invitation demos (music off; local RSVP) |
| `/landing-preview.html` | Static review snapshot of landing JSX; not a React/Next runtime build |
| `/studio` | Clearly labeled entry point to the preserved V14 demo |
| `/demo/studio-v14.html` | Exact original offline-capable V14 editor, not a production renderer |
| `/api/health` | Application liveness only, no DB readiness claim |
| unmatched | Custom 404 |

`npm run prepare:demo` verifies the archived V14 SHA-256 and copies it unchanged into public/demo; then generates the five individual previews via the existing V14 renderer; predev and prebuild call it. The original 5 templates, scripts, assets, design and V15 contracts are under `reference/v16/`, preserved from the original V16 ZIP. Keep references immutable and use a separate implementation source in later milestones. A standalone demo can be opened directly from `public/demo/studio-v14.html` without installing Next.js, but local storage behavior depends on the browser/origin.

## V18 implementation and review
- `app/components/landing.tsx`, `app/landing.css`: responsive ivory/burgundy editorial marketing page, native details/summary envelope, five linked cards, process section and CTA. Uses original registry via `lib/showcase.ts`.
- `public/showcase/`: optimized WebP copies of actual V14 screenshots and existing fictional couple photo. No new third-party assets or dependencies.
- `scripts/build-showcase.mjs`: deterministic build-time V14 rendering, no modifications to immutable source. Individual demos use music off and a visible demo label. The original editor still supports music.
- `node scripts/review-landing.mjs`: produces a static review snapshot from the actual presentational JSX using TypeScript transpilation and a small review-only HTML adapter. This is not Next.js SSR. Open `public/landing-preview.html` after extracting the entire archive; its relative preview links require the adjacent `demo/` folder. The snapshot embeds photos for offline review.
- `npm test`: foundation and showcase assertions. Regenerate snapshot with `node scripts/review-landing.mjs` before testing changes to the landing component. `python tests/review_landing.py` runs targeted Chromium checks (requires Playwright and Chromium, adjust executable path if necessary).
- Production deployment, indexability, auth, publishing, database, payment, pricing, and customer dashboard remain out of scope. Retain noindex during staging. It is not access control.

## Stop gate
Source and targeted QA complete. Actual dependency install, Next build, semantic type checking, HTTP route/link navigation, Safari, real devices, full regression and Lighthouse remain pending. Registry access was blocked at V17; not retried in V18 under the usage protocol. Review-only static rendering cannot establish Next runtime readiness. See TEST_REPORT_V18.txt. Next authorized milestone when requested: V19 customer dashboard. Do not expand scope.
