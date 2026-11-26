# AMPLOP V16 — Master Codex Implementation Package
One consolidated preparation bundle. No Codex execution, application repository mutation, deployment, or production provisioning performed in V16.

## Start here (Bahasa Indonesia)
1. Unduh ZIP dan ekstrak. Buka proyek AMPLOP lama yang benar di Codex (bukan repository bisnis lain).
2. Letakkan paket sebagai folder referensi lokal yang dapat dibaca agent, misalnya `docs/amplop-handoff/`. Jangan menimpa AGENTS.md milik proyek. Jika sudah ada AGENTS.md, minta Codex membaca keduanya dan usulkan merge aturan yang kompatibel setelah audit; jangan commit paket berisi screenshot/demo bila tidak perlu.
3. Kirim isi `START_HERE_CODEX.txt`. Tahap pertama hanya audit, tanpa edit repo atau deployment.
4. Review laporan audit, lalu gunakan satu prompt dari `prompts/MILESTONE_PROMPTS.md` per tahap. Jangan mengirim seluruh prompt sekaligus.
5. Buka `reference/v14/amplop-studio-v14.html` untuk menilai baseline visual. V14 masih prototype offline; jangan anggap sebagai SaaS.

## Contents and authority
- `AGENTS.md`: proposed agent guardrails, `MASTER_IMPLEMENTATION_PLAN.md`: staged work and definition of done, `START_HERE_CODEX.txt`: audit-only initial prompt.
- `reference/v14/`: exact archived V14 reference source, compiled demo, original reports, 5 templates, 12 assets, legacy test scripts and staging gates. The build's legacy `amplop-studio-v13.html` name is intentional; V14 and that file must match after build.
- `architecture/`: V15 SQL draft, data contract, API YAML, example, verification code, acceptance gates; proposed, not executed on a database.
- `design/`: historical V3 Design Bible and original asset inventory; newer V14 takes precedence.
- `rollback/`: V13.1 archive, not a Git rollback of the existing app.
- `tools/`: non-destructive package verifier, optional scratch QA runner, test dependencies. `MANIFEST.sha256` verifies bundle contents; `PACKAGE_CHECKS.txt` records V16 packaging checks only.
- `DECISION_REGISTER.md`: owner decisions still open. `ADAPTER_CONTRACT.md`: translation and security gates. `RELEASE_EVIDENCE_TEMPLATE.md`: actual results to collect.

Existing repo was not accessible in V15. Audit is the first blocking milestone. Web/device testing deferred by owner to Codex/staging; owner must test physical devices where agent lacks hardware. Do not assume current package includes real webfont binaries or approved catalog tracks. Demo upload remains 2 MB; production 15 MB is a proposal. Historical evidence: V13.1 179 checks, V14 61 focused checks, V15 9 contract checks. These are not additive current release passes.
