# Phase F: Document Viewer Interface V2

## Outcome

Bring `cv.atlas-systems.uk` into the accepted Atlas Public Interface System v2
while preserving the existing document, deliberate load gate, mobile PDF
handoff, download path, indexing policy, and independent Cloudflare Pages
deployment.

This is a presentation, navigation, verification, and preview migration. It is
not a CV-content rewrite or a PDF delivery redesign.

## Source authority

- Governance: `AtlasReaper311/atlas-infra` accepted ADR-0008 and
  `policy/public-interface-system-v2.json`
- Shared presentation: repository-local Atlas Interface Kit v0.1.1
- Document asset: `Atlas_Reaper_System_Architect.pdf`
- Viewer behaviour: `js/viewer.js`
- Estate search and aggregate status: `js/estate-search.js`,
  `js/estate-status.js`, and `js/interface-shell.js`
- Deployment: this repository's independent Pages workflow and the
  `atlas-doc-viewer` Cloudflare Pages project

## Protected boundaries

Phase F must not:

- rename, rewrite, recompress, replace, or otherwise modify the PDF;
- change the canonical `https://cv.atlas-systems.uk/` route;
- remove `noindex, follow` from the surrounding viewer page;
- remove the explicit initialise and download choices;
- replace desktop embedded viewing or mobile native PDF handoff;
- add analytics, authentication, paid services, or cross-domain runtime CSS;
- change the production Pages project, domain, provider settings, or secrets;
- merge or deploy production before manual visual approval of the exact preview
  commit.

The protected PDF fingerprint is:

- bytes: `233956`
- SHA-256:
  `8740f30de204ef8f18275c95a1c1abe1d975c60ae4d46dc6710e96868562fc88`

## Accepted V2 expression

- Desktop uses the canonical three-zone header:
  - left: `ATLAS_SYSTEMS` and aggregate estate status;
  - centre: Work, Writing, Lab, Systems, About;
  - right: persistent estate search.
- Mobile keeps identity, status, and search in the top header and moves the
  five estate routes to fixed bottom navigation.
- The product strip identifies the surface as a public CV document viewer and
  keeps document readiness separate from aggregate estate health.
- The opening gate is spacious, editorial, and document-first. It may use a
  restrained document diagram, but no decorative photography.
- The public role order is systems engineering, software and AI, audio, then
  game development.
- The viewer retains a clear close action, explicit download access, bounded
  assistive announcements, and Escape-key closure.
- Atlas-owned destinations remain same-tab. External destinations use a new tab
  with `noopener noreferrer`.

## Implementation ownership

- `index.html` owns semantic structure, metadata, the gated document surface,
  and navigation.
- `css/cv.css` owns product-specific document presentation while consuming the
  pinned V2 tokens and component foundations.
- `js/viewer.js` owns only the established gate, mobile handoff, embedded object,
  close, focus, and announcement behaviour.
- `js/interface-shell.js`, `js/estate-status.js`, and `js/estate-search.js`
  retain bounded public shell behaviour.
- `.github/workflows/interface-preview.yml` owns exact-head validation, the
  non-production Pages preview, and browser evidence.

## Evidence required

The exact draft-PR head must prove:

1. Interface Kit manifest fingerprints and contract version;
2. the protected PDF byte count and SHA-256;
3. valid HTML and JavaScript syntax;
4. interface, gate, search, link, status, and indexing tests;
5. offline link validation;
6. Chrome and Firefox at 320, 375, 768, 1024, and 1440px;
7. no horizontal overflow or serious/critical accessibility violations;
8. canonical desktop and mobile navigation, visible focus, 44px controls, and
   fixed-bottom-navigation clearance;
9. desktop initialise, embedded viewer, close, focus return, and download
   contracts, including clearance below the sticky estate header;
10. mobile document-first layout without changing the native PDF handoff;
11. screenshots and machine-readable evidence retained for 14 days and tied to
    the exact commit.

Accessibility analysis runs after the short viewer-reveal transition has
settled, so the audit measures the final token colours rather than a
partially-transparent animation frame.

## Rollout and rollback

The pull request remains draft until the exact preview is approved. Production
remains unchanged during review. Before merge, close the draft PR and remove its
preview branch if rollback is needed. After an approved merge, revert the Phase
F merge commit and let the existing Pages deployment restore the previous
viewer shell. The PDF remains unchanged in either direction.
