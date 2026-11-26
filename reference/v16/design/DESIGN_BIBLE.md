# AMPLOP — Signature Collection / Design Bible v3
25 November 2026 | Proposed art direction; owner approval before production | Companion to Preflight V2, not a replacement for the implementation contract.

## 1. Intent and non-negotiables
Not just an invitation. An experience. Immersive, personal, emotional. Five distinct visual narratives and openings; one canonical event/guest data model. Design for the guest's phone first. No generic cards, interchangeable color-only themes, unnecessary confetti, forced audio, mandatory animation, or horizontal scroll trap. Every motion has a purpose: anticipation, reveal, orientation or closure. Original artwork and code only; external inspiration is not permission to copy. Decorative English editorial headlines; Indonesian actionable copy. Data in preview is fictional (Adrian & Clara, 20 June 2027, Surabaya). This is a visual direction proposal, not approved assets or finished website. Scope first production implementation remains Secret Letter only, per V2.

## 2. System rules
- Mobile widths 320/360/390/430; tablet 768; desktop 1440; landscape 844×390. Gutter 24px, 16px at 320; desktop grid max 1200px, 12 columns, 24–32px gap. 4px spacing system; section breathing room 64–96px mobile, 100–144px desktop. Body 16–18px, 1.6–1.8 line height, input min 16px, action target min 44×44px. Text width 40–70 characters. Editorial labels 10–12px with spacing, not for essential instructions. Focus visible and contrast WCAG AA; verify actual contrast at every overlay. Decorative gradients may not obscure reading. Preserve event accessibility regardless of theme.
- Motion tokens: quick 150–220ms; responsive 280–400ms; reveal 500–700ms; scene 900–1200ms; opening cap 3.2s. Default easing cubic-bezier(.22,.8,.22,1), exit ease-in. Use transform/opacity; scope animation cleanup. Native scroll; no scrolling hijack. Pin only if content remains reachable and mobile has a static fallback. Motion disabled: immediate state change, static content, no parallax/zoom/scrub. Skip visible; Escape and keyboard work; focus moves to hero, timers cleaned. Gate not required to read event details if JS fails. Audio opt-in, never automatic; no track until licensed.
- Shared canonical data: couple + monogram, wedding date/timezone, events, guest display name, hero/story/gallery media, RSVP config, closing, language. Keep functional logic shared, not identical layout. Every theme must tolerate missing media and long names, preserve guest data and URLs across themes. Follow V2 data contract, accessibility and tests; defer auth/payments/server RSVP. No duplicated data in production theme. Preview is an intentionally standalone sketch with mock data.
- Asset budgets proposal: mobile hero ≤300KB, below-fold each ≤200KB, initial transfer ≤800KB excluding opt-in audio, initial incremental JS ≤150KB gzip. Cinematic video loaded only after interaction and separate budget measured; poster first, static fallback. Predeclare image dimensions, lazy-load below fold, use responsive sizes and accessible text/alt. No external asset requests in prototype. LCP/INP/CLS targets per V2, lab vs field distinction.

## 3. Theme 01 — The Secret Letter
**Signature: Unseal the love.** Tactile stationery; warm ivory, burgundy, fine line botanical engraving and gold as decoration. Tokens: paper #F7F1E7, ink #392D29, wax #713A42, muted #675B51, line #C8B89C, ornament #A08155. Typography: refined italic serif display (Georgia fallback; candidate Cormorant Garamond), restrained sans for metadata and controls. Avoid generic stock wax seal PNG.

| Screen | Composition / responsive layout | Motion & behavior |
|---|---|---|
| Gate | Centered envelope, real-looking flap, personalized guest below, wax focal point; desktop max 460px visual; mobile 75–82vw; explicit Open/Skip | V2: seal 0–220ms, flap 150–830, letter 540–1490, hero handoff 1520–2550. No bounce. |
| Hero | Letter becomes ivory hero; monogram engraving above large stacked serif names, date, event jump; mobile names wrap naturally | Paper matching scene transition, focus heading, subtle once-only reveal |
| Story | Three chronological chapters with roman numerals; desktop alternating photo/text; mobile vertical letter-like narrative | 18–28px reveal and fade once, 550–650ms |
| Events | Fine horizontal rules, clear date/time/timezone, ceremony and reception separate, directions and calendar | No delayed critical actions; optional decorative line reveal |
| Gallery | Tactile photo prints, staggered desktop arrangement, mobile swipe or stacked; captions | Mask reveal 650ms; tap full image only if accessible modal |
| RSVP | Uncluttered letter reply form; native inputs, localized feedback | Acknowledgement as quiet seal mark, not required for success |
| Closing | Folded-paper motif, monogram and thanks | Once-only fade 500ms |

Assets: envelope front/back/flap and seal original CSS/SVG, line botanical SVG, paper texture tile optional, 1 hero portrait and 3–6 approved photos; optional license-cleared font/audio. Current preview originals: envelope shapes and line art; photography, texture and music not supplied. Production opening must follow V2 handoff (preview uses separate gate/hero swap as a concept illustration). 

## 4. Theme 02 — Cinematic Romance
**Signature: A film of us.** Art direction: warm film grain, deep slate, amber highlight, understated serif credits. Tokens: background #161B20, ink #F7EDDD, accent #E5BD87, muted #D1C6B9, line #68635D. Display: Georgia fallback; candidate high-contrast serif. Essential controls always readable on dark backdrop.

| Screen | Composition / responsive layout | Motion & behavior |
|---|---|---|
| Gate | Poster in frame, title card, invitation salutation, play and skip | Title fade 220ms; poster dolly-in/crossfade 250–1450ms; no actual video required for access |
| Hero | Full-bleed portrait or film still; lower-third names and date; mobile portrait focal crop | Optional slow zoom 1.00→1.035 only; stop if reduced motion |
| Story | 3 distinct scenes; desktop sticky image with adjacent text; mobile sequential panels, no trapping | ScrollTrigger normalized progress; only one scene active; video time p×duration if scrubbing supported. Static posters if slow/unsupported; scrubbing never blocks text. |
| Events | Bright, legible credit-like typography on solid dark background | Simple cuts or fade, immediate actions |
| Gallery | Film strip horizontal native swipe with visible next/prev and vertical fallback | Crossfade 400ms; keyboard access |
| RSVP | Clean dark form, light focus ring, single confirmation | Quiet fade 220ms |
| Closing | Film credits and title end card | Fade to monogram; no autoplay outro |

Assets: poster in 9:16 and 16:9 crops, three chapter stills, optional 6–12s muted licensed clip with keyframes suitable for scrubbing, 3–6 photos. SVG abstract landscape in preview is not real video; slider demonstrates changing progress only. Production scroll linkage and video encoding still to implement. Never use decorative filmgrain over readable text.

## 5. Theme 03 — The Wedding Editorial
**Signature: Every page, a memory.** Art direction: premium editorial, warm monochrome, grid rhythm, typographic contrast. Tokens: background #F3F0E8, ink #22211F, accent #292722, muted #656159, line #A5A095. Display: Georgia fallback; candidate high contrast Bodoni Moda; sans for folio and navigation. No imitation of a branded magazine masthead.

| Screen | Composition / responsive layout | Motion & behavior |
|---|---|---|
| Gate | Magazine cover, volume number, date, guest dedication | Cover hinge CSS perspective 0–1050ms, finish by 1200ms; skip accessible |
| Hero | Desktop asymmetric split image + oversized names, 7:5 ratio; mobile single portrait and large title | Image mask 600ms, title fade 500ms, no text cut off |
| Story | Interview-style pull quote, three columns desktop, single column mobile, chapter folios | Scroll-based masking on images only, text readable before animation |
| Events | Magazine agenda with clearly marked time, venue and action links | Horizontal rules and editorial section breaks |
| Gallery | Alternating spreads, native swipe with buttons; mobile stack fallback | Page-turn only by deliberate action, no simulated scroll lock |
| RSVP | Reply slip, editorial labels, prominent submit | 250ms feedback |
| Closing | Back cover with issue/date/monogram | Static end cover or 500ms reveal |

Assets: 1 portrait + 4–6 coordinated editorial photographs, vertical and horizontal crops, fine grid rules CSS, local typography if licensed. Current preview magazine cover, stylized illustrated placeholders; photography not final.

## 6. Theme 04 — The Enchanted Garden
**Signature: Where love blooms.** Art direction: botanical arch, sage, cream, warm light, original plant linework (not borrowed ornaments). Tokens: background #E8E8D3, ink #283E31, accent #315841, muted #485C49, line #97A68B. Display serif/italic, readable sans actions.

| Screen | Composition / responsive layout | Motion & behavior |
|---|---|---|
| Gate | Arched garden door, paired botanical panels, names inside | Door split 0–1200ms; interior reveal by 1350ms; skip accessible |
| Hero | Arched scene, centered names and date; mobile simplified layer count | Layered parallax max 3–4 layers on mobile; static reduced motion |
| Story | Seed → bloom → garden chapters, framed botanical illustrations | Bloom scale .9→1 + opacity, 650ms once; no floating endless particles |
| Events | Garden signpost-inspired blocks, clear text + actions | Immediate event access |
| Gallery | Arch-framed portraits, native swipe/stack | Fade 500ms; no complex filters |
| RSVP | Simple botanical border, no tiny floral labels | Confirmation 250ms |
| Closing | Botanical wreath and monogram | Final bloom 650ms |

Assets: original SVG gate, distant foliage, near foliage, floral ornaments, 3–5 approved portraits; no WebGL required. Current preview simple geometric gate and original botanical landscape. More detailed illustration needed after approval; separate layers for motion, cap DOM complexity.

## 7. Theme 05 — Our Story
**Signature: Collect our memories.** Art direction: tactile scrapbook, cream paper, terracotta, layered instant photos, handwritten accents only for decorative text. Tokens: background #F5E6D4, ink #47362B, accent #A24F3E, muted #6E5647, line #C7A98B. Georgia italic, body sans; candidate Caveat only for nonessential captions.

| Screen | Composition / responsive layout | Motion & behavior |
|---|---|---|
| Gate | Small stack of prints and central note, recipient dedication | Cards fan 0–1000ms; hero by 1150ms; skip accessible |
| Hero | Split handwritten title + taped photo desktop; single stacked mobile | Photo settles rotation to near-flat; text static |
| Story | Memory board of 3–6 cards with short notes and dates; mobile one-column stack | Explicit open/close note button; drag optional enhancement with keyboard controls and no required dragging |
| Events | Calendar page with date highlighted and separate venue details | Static, readable; actions immediate |
| Gallery | Photo prints in grid/swipe, no random overlap hiding captions | Tap to reveal short note; clear close button |
| RSVP | Postcard-style reply, native form controls | Visible success/error copy, no forced animations |
| Closing | Last page, short thank-you note | Photo stack settles 500ms |

Assets: 5–8 approved photos, optional paper/tape SVG, original handwritten accents and sample letters. Current preview stylized placeholder art and interactive note toggle, not real drag interaction. Native scroll stays available.

## 8. Asset production manifest / review gate
See ASSET_MANIFEST.csv for requested assets, aspect ratios, budgets and status. No final photography/video/audio delivered. Owner decides whether demo should use generated fictional imagery (not real couple) or supplied/licensed photos. For generated visuals, record origin, prompts, and approval; for supplied/licensed assets, record rights and usage scope. Do not add remote stock images or copyrighted music. Export optimized WebP/AVIF and original vector where applicable; no sharing font files. Candidate fonts are suggestions, not included dependencies; verify actual license before bundling. Source filenames stable, no spaces, separate originals from web derivatives. All actual personal data requires privacy and consent controls later.

## 9. Review and execution
`preview.html` is a standalone design lab with 5 distinct gates + hero/story sketches + event/closing examples. It is not final design or the production invitation. It demonstrates click, skip, replay, cinematic slider, and scrapbook note toggle. It has no server, actual video, music, guest management, RSVP submission, or real Maps. Design-only preview uses illustrative placeholders; V2 Secret Letter proof of concept remains mechanics reference. No framework migration or all-five production build yet. Check actual test report for verified behaviors, including any defects/limitations. Screenshot approvals are a gate before Codex, not a promise of pixel parity with unseen assets.

Approval order: (1) choose palette and distinct concept, (2) approve mobile gate/hero and desktop split, (3) approve final original assets and typography, (4) verify interaction in real Android/iOS, (5) supply existing repo or explicitly approve a new repo, (6) give Codex V2+V3, implement one theme only, (7) evaluate P0 acceptance and screenshots, then template 02. Do not mark final art direction or assets approved without user feedback. Do not claim browser/deployment or backend success beyond actual tests. This reduces ambiguity; exact usage savings are unknown.
