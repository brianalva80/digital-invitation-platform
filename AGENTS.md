# AMPLOP — active project instructions (V26)

## Current scope and precedence
AMPLOP is transitioning from V25 self-service SaaS to an admin-managed digital wedding invitation service. V26.2 Public Portfolio and WhatsApp Checkout is the only currently authorized milestone. Implement an independent static portfolio inside `portfolio/` and update this file and `V26_SCOPE.md` to reflect the active milestone. Do not deploy, commit, or push. Do not change historical V25 application source, dependencies, migrations, or reference assets; preserve V25 functionality and artifacts. Preserve the five approved designs, assets, animations, music, and original V14 rendering engine. Keep `reference/v16/` immutable and do not edit generated `public/demo/studio-v14.html`; reuse only approved public assets and demos by copying them into the independent portfolio when needed. Read `reference/v16/AGENTS.md` for compatible design, security, and test guardrails.

## Product boundaries
- Public visitors browse five invitation portfolios, open interactive demos, select a design, and order only through WhatsApp `6285786755308`. They have no registration, login, or editing capability.
- The business owner uses a private, local Admin Studio to create independent client projects, edit invitation content, save/reopen drafts, preview, revise, export, and deploy completed invitations to Vercel. Admin Studio and private drafts must not enter public deployment artifacts.
- Paying clients receive completed invitations via WhatsApp and use a sharing tool to enter guest names, generate personalized URLs/messages, copy links, and share through WhatsApp. Clients cannot edit design or wedding content.
- Invited guests view the personalized published invitation and its supported interactions, but cannot edit invitation content.
- No customer authentication, Midtrans, public invitation builder, customer wedding planner, or Supabase dependency for the initial release. Do not claim online RSVP works without a backend. Do not introduce dependencies unless a later authorized milestone requires them.

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

## Engineering and security rules
- Treat every client project as isolated. Guest names and all other external input are untrusted: validate and contextually encode values; prevent HTML/script injection; construct personalized URLs with safe URL encoding. Do not allow arbitrary user HTML, CSS, or unsafe URLs.
- Preserve stable invitation URLs across content revisions. Do not treat hidden routes or `noindex` as access control. Keep editors and private drafts out of public deployment artifacts; use a protected local/private boundary for Admin Studio.
- Keep V14 as the immutable visual/rendering reference. Preserve the five distinct designs and their approved assets, signature animations, native scrolling, skip/replay, reduced-motion behavior, music interaction constraints, and per-template customization when relevant to an authorized task.
- Use existing project scripts and dependencies; avoid dependency or lockfile changes unless specifically required and authorized. Do not apply SQL drafts automatically. Do not expose credentials in browser bundles, logs, `NEXT_PUBLIC` variables, or committed files.
- Use fictional data in prototypes and tests. Never commit real client data or credentials to the existing public repository. Do not provision services, deploy publicly, change production data, run real payments, or consume Codex/Work without explicit owner approval. Vercel preview deployment belongs to its separately authorized roadmap milestone.
- Preview is not an access-control boundary. Noindex is not authentication or privacy. Do not imply backend-dependent features, including online RSVP, work without verified backend implementation.
- Targeted tests first; report actual command outcomes and blocked gates. Do not count historical QA as current runtime evidence or claim production readiness without release evidence. Browser/full regression, native storage, Safari, physical-device testing, and Lighthouse require appropriate runtime/staging authorization.
- Preserve user changes. Make small, reversible patches. Never force-push, reset, or clean. Stop on conflicting requirements, destructive migration, unknown entitlement rules, or inaccessible repositories; report the concrete blocker.

## Milestone control
Follow `V26_SCOPE.md` as the roadmap and acceptance record. Work only on the explicitly authorized milestone and its files. Current authorization is V26.2 Public Portfolio and WhatsApp Checkout. The portfolio is a separate static deployment artifact; never deploy the repository root as the V26 public portfolio. Keep `noindex` until commercial release, but do not treat it or hidden links as access control. Keep demos fictional and clearly label local-only RSVP interactions as demos, not operational RSVP. Stop once V26.2 acceptance criteria are met; do not begin V26.3 or later milestones without owner approval.