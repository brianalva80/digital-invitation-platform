# AMPLOP V13.1 — Extended QA patch
Use this as latest prototype baseline in place of V13. This is not the V14 design freeze.

- Source files: templates/, engine.js, studio.js, shared.js, audio-runtime.js, typography.js, assets/, studio-shell.html, build_studio.py.
- Open amplop-studio-v13-1.html for standalone demo. The build script outputs amplop-studio-v13.html for compatibility with test scripts; copy it to the versioned preview name after building.
- Run `python build_studio.py`, `python test_regression.py`, `python test_v13.py`, `python extended_qa/extended_qa.py`, `python extended_qa/diagnostics.py` with Chromium, Playwright, and ffmpeg available.
- Previous V13 checks rerun: 121 passed. Extended suite: 58 passed, zero failed after fixing 11 long-name failures. 3 blocked checks remain. Test output counts assertions, not unique features.
- Fixes: wrapping + safe scroll alignment for long names; adaptive typography at >32 code points; dynamic cover names/date for Editorial and Cinematic. Decorative long-name letter text may be clipped intentionally; full names remain available in hero.
- Diagnostic measurements are local only. See EXTENDED_QA_REPORT.txt and JSON evidence. Native storage, real browser navigation, Safari, WhatsApp, Lighthouse, physical touch and audio audition remain unresolved. The draft storage double is not evidence of native persistence. Do not claim full security, WCAG compliance or no leaks.
- Retain all signature interactions and V13 production constraints. Do not advance to commercial release until remaining release gates are verified on a real deployed staging origin. No repository or backend modified.
