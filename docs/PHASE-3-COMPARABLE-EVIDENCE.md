# Phase 3 comparable interface evidence

The CV viewer keeps its existing product-specific evidence for explicit initialisation, protected local PDF loading, desktop embedding, mobile native handoff, Escape handling, and focus return.

A separate `atlas-public-interface/evidence/v1` record adds comparable Chrome and Firefox measurements at 320, 375, 768, 1024, 1440, and reporting-only 1920 pixel widths. It records semantic structure, WCAG 2.2 findings, keyboard focus, console and page errors, failed requests, HTTP errors, request counts, transfer sizes, and CSS and JavaScript resource counts.

Product findings are reporting-only during Phase 3. Existing document-viewer contract failures remain blocking. The change does not alter the protected PDF bytes, indexing policy, viewer behaviour, or production deployment.
