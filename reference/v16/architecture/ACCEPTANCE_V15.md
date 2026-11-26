# AMPLOP V15 — Mandatory acceptance gates (not executed)
Use V14 STAGING_ACCEPTANCE.md in addition to this document. Every row needs commit, environment, test evidence and result. No prior prototype count counts as production test evidence.

| ID | Scenario | Required result |
|---|---|---|
| A01 | Audit actual repo / baseline | Existing build and routes reproducible; no destructive edits |
| A02 | All five templates integrated | Compare at 320/390/1440, opening/skip/replay preserve V14 signatures |
| A03 | Full regression suites | V12, V13, V13.1, V14 tests ported or adapted; report actual results |
| B01 | User A requests user B wedding/draft | Denied even with guessed UUID |
| B02 | User A attempts B asset/order/guest writes | Denied; no changed record |
| B03 | Unauthenticated preview/draft | Denied; no cache leak |
| B04 | Two editors save same revision | One succeeds, other gets 409, unsaved edits preserved |
| B05 | Save reload via real HTTP origin | Native storage and cloud revision restored |
| B06 | Free preview all five templates | No payment needed; data retained |
| B07 | Unpaid publish or export bypass | Server denies public publication and commercial export |
| B08 | Client tampers with payment amount | Server ignores/rejects; canonical price only |
| B09 | Fake signed/unsigned callback | No entitlement |
| B10 | Verified duplicate callback, concurrent delivery | One entitlement, idempotent |
| B11 | Out-of-order pending callback after paid | Paid retained |
| B12 | Payment amount or order mismatch | Review, no entitlement |
| B13 | Publish with valid entitlement and revision | Atomic version+pointer, public route works |
| B14 | Draft edit after publish | Public version unchanged until apply |
| B15 | Switch template/music and apply | Same slug and guest links, no duplicate charge |
| B16 | Publish fails mid-transaction | Previous public version intact |
| B17 | Unpublish, expired/refunded access | Public denied per configured policy; cached content invalidated |
| B18 | Guest token invalid/rotated | Denied, no guest enumeration |
| B19 | Guest A submits RSVP for guest B | Denied; guest identity server-derived |
| B20 | Repeat RSVP, limit exceeded | Upsert only own row; invalid party rejected |
| B21 | Malformed asset or cross-tenant asset ID | Rejected, cannot publish |
| B22 | Upload supported audio/photos | Decode verified, approved limits, no EXIF, no arbitrary SVG |
| B23 | Pending or rejected asset referenced | Publish denied |
| B24 | Published snapshot refers to old asset | Still accessible until publication no longer references it |
| B25 | Public response/logs/referrer | No private notes, contact, raw token, order or secret |
| B26 | Admin permission and audit | Least privilege, audited elevated actions |
| B27 | Backup restore staging | Restore verified without live customer data |
| B28 | Browser, physical devices, Lighthouse | V14 staging acceptance with actual evidence |
| C01 | QR duplicate/concurrent scan | One attendance row; no unintended duplicate |
| C02 | Private PIN brute force | Rate limiting, no raw PIN stored |
| C03 | Lucky wheel eligibility | One winner per prize, audited draw, no duplicate |
| D01 | Budget totals | Integer IDR sum consistent and tenant-isolated |
| D02 | Planner, vendor, rundown | Role-scoped CRUD and no guest disclosure |

Release A before B. C and D are later release gates, not requirements to build now. Actual price, expiry, refunds, media quotas and approved music/font assets must be decided before accepting live money. Final visual freeze after owner review on staging. No real customer data in test fixtures.
