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

A small HTML and CSS wrapper for serving a static PDF cleanly across devices. It powers the CV at [cv.atlas-systems.uk](https://cv.atlas-systems.uk).

## The problem

Mobile browsers do not render embedded PDFs reliably. On iOS Safari and Android Chrome, a direct link to a PDF often forces a download or shows a blank page instead of viewing it inline. For a portfolio or a CV link that someone opens on a phone, that is a broken first impression.

## The approach

The wrapper switches presentation by viewport rather than by user agent, so there is no device sniffing to maintain.

- **Desktop.** The PDF renders in a full-screen, borderless `iframe` for immediate viewing.
- **Mobile.** A CSS media query (`@media screen and (max-width: 900px)`) swaps in a touch-friendly open screen that hands the file to the device's own PDF view, avoiding the blank-render behaviour.
- **Aesthetics.** Dark and matte by default, matching the rest of Atlas Systems and keeping attention on the document.

The state switch is CSS only; there is no heavy JavaScript to ship or break.

## Tech

- HTML5 and CSS3 (Flexbox)
- CSS-based state switching by viewport
- Built for Cloudflare Pages (works equally on Netlify or Vercel)

## Usage

1. Drop `index.html` into your root directory.
2. Place the target file (for example `resume.pdf`) in the same folder.
3. Update the `href` and `src` attributes to match the filename.
4. Deploy.

## How it fits into Atlas Systems

This is the tooling layer that serves the CV under its own subdomain, kept separate from the main site so the document and the portfolio deploy independently. It is small on purpose; the point it proves is that a single well-chosen CSS breakpoint can solve a cross-device problem that usually gets reached for JavaScript.

---

Part of [atlas-systems.uk](https://atlas-systems.uk)

