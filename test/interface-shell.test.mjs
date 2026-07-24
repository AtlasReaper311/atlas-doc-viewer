import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  STATUS_ENDPOINT,
  STATUS_STALE_AFTER_MS,
  parseEstateStatus,
} from "../js/estate-status.js";

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/cv.css", "utf8");
const kitCss = fs.readFileSync(
  "assets/interface/v0.1.1/atlas-interface-kit.css",
  "utf8",
);
const shell = fs.readFileSync("js/interface-shell.js", "utf8");
const search = fs.readFileSync("js/estate-search.js", "utf8");
const viewer = fs.readFileSync("js/viewer.js", "utf8");
const evidence = fs.readFileSync(
  "scripts/capture-interface-evidence.mjs",
  "utf8",
);
const NOW = Date.parse("2026-07-23T08:00:00Z");
const snapshot = (
  operational,
  total,
  checkedAt = "2026-07-23T07:55:00Z",
) => ({
  estate: { operational, total_components: total, checked_at: checkedAt },
});

test("CV gate and protected document identity remain present", () => {
  assert.match(html, />Initialize PDF</);
  assert.match(html, /Atlas_Reaper_System_Architect\.pdf/);
  assert.match(html, /id="gate"/);
  assert.match(html, /id="viewer"/);
  assert.match(html, /download="Atlas_Reaper_System_Architect\.pdf"/);
  assert.match(html, /The document stays unloaded until requested/);
});

test("CV indexing and canonical policies remain bounded", () => {
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.doesNotMatch(html, /noindex, nofollow/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/cv\.atlas-systems\.uk\/">/,
  );
});

test("document uses one principal heading and one main landmark", () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.match(html, /aria-labelledby="gate-title"/);
  assert.match(html, /aria-labelledby="viewer-title"/);
});

test("repository-local Interface Kit v0.1.1 is pinned", () => {
  assert.match(
    html,
    /\/assets\/interface\/v0\.1\.1\/atlas-interface-kit\.css\?v=0\.1\.1/,
  );
  assert.doesNotMatch(
    html,
    /https:\/\/[^"]*atlas-interface-kit[^"]*\.css/,
  );
});

test("desktop header uses the canonical five-route order", () => {
  const routes = ["/work/", "/writing/", "/lab/", "/systems/", "/about/"];
  let previous = -1;
  for (const route of routes) {
    const position = html.indexOf(`https://atlas-systems.uk${route}`);
    assert.ok(position > previous, `${route} is missing or out of order`);
    previous = position;
  }
  assert.match(html, /class="atlas-global-header cv-global-header"/);
  assert.match(html, /class="atlas-global-header__nav"/);
  assert.match(html, /data-estate-search-open/);
});

test("mobile navigation preserves the canonical five routes", () => {
  assert.match(html, /class="atlas-bottom-nav"/);
  assert.match(html, /data-atlas-bottom-nav="true"/);
  assert.match(html, /href="https:\/\/atlas-systems\.uk\/about\/" aria-current="page"/);
  assert.match(
    kitCss,
    /padding-bottom: calc\(64px \+ env\(safe-area-inset-bottom\)\)/,
  );
});

test("product and document states remain separate from estate status", () => {
  assert.match(html, /class="atlas-product-strip cv-product-strip"/);
  assert.match(html, /class="cv-document-state"/);
  assert.match(html, /class="atlas-status estate-status"/);
  assert.match(viewer, /setDocumentState\("Viewer active", true\)/);
  assert.match(viewer, /setDocumentState\("Ready to initialise", false\)/);
});

test("public role order follows the accepted owner direction", () => {
  assert.match(
    html,
    /Systems engineering · Software and AI · Audio · Game development/,
  );
});

test("gate remains document-first without decorative photography", () => {
  assert.match(html, /class="document-dossier"/);
  assert.match(html, /class="document-sheet"/);
  assert.doesNotMatch(html, /<img\b/);
  assert.doesNotMatch(css, /background-image:\s*url\(/);
});

test("Atlas-owned links do not open new tabs", () => {
  const owned = html.matchAll(
    /<a\b[^>]*href="https:\/\/[^"]*atlas-systems\.uk[^"]*"[^>]*>/g,
  );
  for (const match of owned) {
    assert.doesNotMatch(match[0], /target="_blank"/);
  }
  assert.match(shell, /anchor\.removeAttribute\("target"\)/);
});

test("aggregate status mapping is bounded, fresh, and fail-closed", () => {
  assert.equal(STATUS_ENDPOINT, "https://api.atlas-systems.uk/v1/stats");
  assert.equal(STATUS_STALE_AFTER_MS, 1_200_000);
  assert.equal(parseEstateStatus(snapshot(19, 19), NOW).state, "operational");
  assert.equal(parseEstateStatus(snapshot(18, 19), NOW).state, "degraded");
  assert.equal(parseEstateStatus(snapshot(9, 19), NOW).state, "unavailable");
  assert.equal(parseEstateStatus(snapshot(20, 19), NOW).state, "unknown");
  assert.equal(
    parseEstateStatus(snapshot(19, 19, "2026-07-23T07:39:59Z"), NOW).state,
    "unknown",
  );
});

test("viewer preserves desktop embed and mobile native handoff", () => {
  assert.match(viewer, /window\.location\.assign\(PDF_PATH\)/);
  assert.match(viewer, /object\.type = "application\/pdf"/);
  assert.match(viewer, /gate\.hidden = true/);
  assert.match(viewer, /viewer\.hidden = false/);
  assert.match(viewer, /frame\.replaceChildren\(buildPdfObject\(\)\)/);
});

test("viewer close restores the gate, focus, and bounded announcements", () => {
  assert.match(viewer, /announcer\.textContent = "CV viewer opened\."/);
  assert.match(viewer, /announcer\.textContent = "CV viewer closed\."/);
  assert.match(viewer, /closeButton\.focus\(\)/);
  assert.match(viewer, /initialise\.focus\(\)/);
  assert.match(viewer, /event\.key === "Escape"/);
  assert.doesNotMatch(viewer, /style\./);
  assert.doesNotMatch(viewer, /innerHTML/);
});

test("estate search is local, bounded, and keyboard-contained", () => {
  assert.match(search, /https:\/\/api\.atlas-systems\.uk\/v1\/search/);
  assert.doesNotMatch(search, /corpus\.atlas-systems\.uk/);
  assert.match(search, /atlas-search-dialog/);
  assert.match(search, /aria-modal", "true"/);
  assert.match(search, /noopener noreferrer/);
  assert.match(search, /event\.key === "Tab"/);
});

test("product CSS consumes V2 tokens rather than redefining the brand", () => {
  assert.match(css, /var\(--atlas-bg\)/);
  assert.match(css, /var\(--atlas-card-standard\)/);
  assert.match(css, /var\(--atlas-touch-min\)/);
  assert.match(css, /var\(--atlas-motion-reveal\)/);
  assert.doesNotMatch(css, /--bg:/);
  assert.doesNotMatch(css, /--text:/);
  assert.doesNotMatch(css, /--accent:/);
});

test("visual interaction contract includes focus and reduced motion", () => {
  assert.match(kitCss, /outline: 2px solid var\(--atlas-accent\)/);
  assert.match(kitCss, /prefers-reduced-motion: reduce/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /min-height: var\(--atlas-touch-min\)/);
  assert.match(css, /min-width: var\(--atlas-touch-min\)/);
  assert.match(css, /scroll-margin-top: calc\(56px \+ var\(--atlas-space-3\)\)/);
  assert.match(evidence, /opened\.viewerBarTop < opened\.headerBottom/);
  assert.match(evidence, /getAnimations\(\{ subtree: true \}\)/);
  assert.match(evidence, /animation\.finished/);
});
