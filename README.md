<div align="center">
  <img src="https://raw.githubusercontent.com/AtlasReaper311/AtlasReaper311/main/atlas-icon-dark-256.png" width="88" alt="Atlas Systems"/>
</div>

# atlas-doc-viewer
 
```
┌─────────────────────────────────────────────┐
│  ATLAS SYSTEMS // atlas-doc-viewer          │
│  a static PDF that renders the same way      │
│  on a phone as it does on a desktop          │
└─────────────────────────────────────────────┘
```

![HTML5](https://img.shields.io/badge/html5-f5a623?style=flat-square&labelColor=0a0a0f)
![CSS3](https://img.shields.io/badge/css3-aaa9a0?style=flat-square&labelColor=0a0a0f)
![Cloudflare Pages](https://img.shields.io/badge/cloudflare-pages-4ade80?style=flat-square&labelColor=0a0a0f)
![Cost](https://img.shields.io/badge/cost-%C2%A30-aaa9a0?style=flat-square&labelColor=0a0a0f)

A small, independently deployed document surface for serving a static PDF
cleanly across devices. It powers the CV at
[cv.atlas-systems.uk](https://cv.atlas-systems.uk).

## The problem

Mobile browsers do not render embedded PDFs reliably. On iOS Safari and Android Chrome, a direct link to a PDF often forces a download or shows a blank page instead of viewing it inline. For a portfolio or a CV link that someone opens on a phone, that is a broken first impression.

## The approach

The wrapper switches presentation by viewport rather than by user agent, so there is no device sniffing to maintain.

- **Desktop.** The PDF renders in a full-screen, borderless `object` after the
  visitor explicitly initialises it.
- **Mobile.** The same action hands the local PDF to the device's native viewer,
  avoiding unreliable embedded rendering.
- **Aesthetics.** A spacious, editorial document gate built on the pinned Atlas
  Public Interface System v2 foundation.

The PDF remains unloaded until the visitor asks for it. A small local JavaScript
module owns the explicit initialise, close, focus-return, desktop embed, and
mobile handoff behaviours.

## Tech

- HTML5, CSS, and browser-native JavaScript modules
- repository-local Atlas Interface Kit v0.1.1
- CSS-based responsive composition plus bounded viewer state
- Built for Cloudflare Pages (works equally on Netlify or Vercel)

## Interface contract

Phase F preserves the CV route, PDF bytes, `noindex, follow` policy, explicit
download, desktop embed, mobile native handoff, and independent Pages
deployment. The accepted boundary and rollback plan are documented in
`docs/PHASE-F-DOCUMENT-VIEWER-INTERFACE-V2.md`.

Run the local contract checks with:

```bash
node scripts/verify-interface-bundle.mjs
node scripts/verify-pdf-contract.mjs
node --test test/*.test.mjs
npx --yes html-validate@9.7.1 index.html
```

## Usage

1. Drop `index.html` into your root directory.
2. Place the target file (for example `resume.pdf`) in the same folder.
3. Update the `href` and `src` attributes to match the filename.
4. Deploy.

## How it fits into Atlas Systems

This is the tooling layer that serves the CV under its own subdomain, kept
separate from the main site so the document and portfolio deploy independently.
Its interface follows the estate-wide V2 contract while the PDF, route, and
delivery behaviour remain owned by this repository.

---

Part of [atlas-systems.uk](https://atlas-systems.uk)
