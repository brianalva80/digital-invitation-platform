# V15 canonical content → V14 presentation adapter
Do not store a rendered HTML document or V14's demo localStorage as canonical data. Validate server-side against architecture/DATA_CONTRACT.json and semantic checks; use explicit conversion. Sample publish JSON has demo: asset references, not production assets.

| Canonical source | V14 input / rule |
|---|---|
| wedding.id | `id` stable internal identity, never from an arbitrary public form |
| canonical couple/city/country/timezone/events/story | corresponding V14 fields, validate date/time order and exact renderer slots |
| photos.portrait/walk/window | resolve owned ready assets via verified adapter (trusted URL or bounded safe image representation); V14 demo uses bundled asset names; implement URL support intentionally |
| templateKey | registry slug; verify whitelist, preserve layout |
| templateSettings[slug] | map accentIndex/fontIndex to actual V14 presets, retain independently; inspect engine.js and typography.js; never inject raw CSS |
| audio.source, track/asset, volume, loop, autoOnOpen | resolve approved track or verified ready audio; map to runtime music settings; loop is automatic in V14, configurable loop needs new tests |
| guest session | inject `guest.id`/`guest.name` only from authorized context; generic preview uses synthetic values |
| RSVP | replace demo storage with server request using guest-scoped session; server derives identity, enforce limits/deadline, show actual success/error |

Semantic validation beyond JSON Schema: enforce real dates and offsets, same calendar day for V14, end after start, no overlapping events where forbidden by product rule, known owned assets and ready state, strict enums, no injection, draft revision and entitlement. Drafts can be incomplete; publish requires fully validated data. Verify V15 schema/API constraints match actual adapter; never infer database security from structural validation. Check payment provider statuses and atomic publication in actual implementation. SQL is illustrative; role grants, immutability, storage and transaction procedures are still needed.

Security: avoid copying private guest identity into public snapshots, no raw token in analytics/logs/referrers; server authentication and per-wedding authorization, sandbox preview scripts; no raw user markup. Local file export is prototype/admin-only unless product policy permits. Preview content is visible to recipient browser; cannot guarantee prevention of copying. Test two tenant accounts and malformed asset IDs, public projection and transaction failures before release.
