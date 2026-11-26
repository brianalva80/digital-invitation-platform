# Decisions — unresolved unless explicitly marked
| Decision | Status / default for staging |
|---|---|
| Product identity AMPLOP and five signatures | Working identity and design direction; final visual approval pending |
| Free until publish | Agreed direction; free try-all designs; hosted publishing gated server-side |
| Edit/switch template or music after publish | Desired; stable guest links, one entitlement per wedding proposed, no charge again while valid |
| Pricing, tiers, expiry, renewal, refund/chargeback | Open; sandbox fixtures only; no real money until owner decides |
| Payment provider | Midtrans candidate, actual onboarding and credentials pending |
| Existing repo/framework | Unknown; M0 must inspect actual code |
| Production media limits | Proposed audio 15 MB input, 10 minutes, MP3 normalization; current demo 2 MB. Photo/video limits, quotas and retention open |
| Production music catalog and photography | Demo AI photos and synthetic loops not approved for catalog; owner audition/review, rights attestation for uploads |
| Fonts | V14 plan; actual WOFF2 and licenses not installed; verify on staging |
| Calendar and timezones | V14 adapter supports exactly two same-day events, three story entries/photos, Asia/Jakarta. Wider support after explicit scope and renderer tests |
| Privacy/data retention and guestbook | Decide retention, deletion, consent, moderation and public visibility. V15 RSVP message is private by default; separate public guestbook not implemented |
| Feature gaps from initial wish list | QR/PIN/lucky wheel phase C; planner/budget/vendors phase D. Guestbook, dress code, gift links, maps UX, custom opening/closing video, multiple event types and WO features require scoped decisions. No silent removal of existing functionality during repo integration |
| Optional 3D/video scrubbing | Not required for first integration; Cinematic uses photo scroll scenes, not video scrubbing |
| Domain/staging ownership | Existing deployment unknown; no new paid service or live deployment without consent |
| Design freeze | Not approved; requires staging review, device tests and owner approval |
