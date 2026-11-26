# AMPLOP — active project instructions (V25)
## Current scope and precedence
Owner authorized a NEW application (Option B), not an audit or modification of the inaccessible original site. Current milestone V25 consolidation; preserve V23 wedding day management, V22 guest management, V21 sandbox payment, V20 authentication, V19 dashboard and V14 editor. Future milestones require owner approval. This file supersedes the V16 M0 old-repository requirement for this new app. Read `reference/v16/AGENTS.md` for compatible design, security and test guardrails. V14 remains immutable visual reference; V15 is proposed architecture, not an executable migration. Preserve the original site. Do not provision services, deploy publicly, run real payments, change production data, or consume Codex/Work without explicit owner approval. Do not promise hourly-only Codex usage; weekly usage may also apply.

## Usage Optimization Protocol (owner supplied)
- Prioritize minimal token consumption without compromising quality.
- Reuse existing components, utilities, and design systems.
- Do not rewrite working code unnecessarily.
- Inspect only files relevant to the assigned task.
- Avoid unnecessary repository-wide analysis.
- Do not introduce new dependencies unless required.
- Preserve existing functionality and approved designs.
- Batch related changes into a single implementation.
- Run relevant targeted tests before full regression testing.
- Avoid unnecessary subagents and repeated tool calls.
- Keep progress reports and final summaries concise.
- Stop when all agreed acceptance criteria are satisfied.
- Do not expand the project scope without approval.

## Engineering rules
- Use existing npm scripts; verify latest patched compatible dependency versions and commit lockfile at first successful installation. Do not add animation/UI libraries for the scaffold. V20 adds @supabase/supabase-js for Auth; V23 adds qrcode and its dev types solely for standard QR PNG. No scanner dependency; native camera support with manual fallback. Keep `reference/v16/` immutable; do not edit generated `public/demo/studio-v14.html`; synchronize with `npm run prepare:demo`.
- Prototype uses fictional data; V21 adds unverified sandbox Midtrans and publication integration; no production auth/cloud/payment claims. Generic V21 publication RSVP remains disabled; V22 adds server-backed RSVP only on personal links. Preview is not an access-control boundary. Do not deploy with private/real content. Public sandbox slug URLs are deliberately readable by anyone with the link; noindex is not privacy. `noindex` is not authentication. Use a protected staging environment when authorized.
- Targeted tests first; report actual command outcomes and blocked gates. Never count historical QA as current runtime evidence. Browser/full regression, native storage, Safari, physical devices and Lighthouse deferred to staging by owner. Preserve skip/replay, motion, audio, and per-template customization during later integration.
- Keep approved design choices and business decisions in V16 decision register; do not invent price, validity, refund, or upload policies. Do not apply SQL draft automatically. V20 migration is separate from V15 scratch SQL; apply only after review in isolated staging. Service-role credentials are server-only, restricted to server routes V21–V24; never expose in browser, logs or NEXT_PUBLIC variables.
- V25 is the final pre-Codex source candidate. Next action is read-only/local validation in a new repository, then isolated staging only with owner approval; see CODEX_START_HERE.txt and RELEASE_GATES_V25.md. No feature expansion. V23 and V24 are sandbox only; PIN, QR, staff access, winner draws, and planning persistence require runtime/database verification. V24 planning is owner-only, independent of payment; vendor payments are manual records only. Stop when assigned acceptance criteria are met or blocked; concise evidence and next action.
