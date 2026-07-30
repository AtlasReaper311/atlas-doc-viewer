import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/phase-6-footer.css", "utf8");
const viewer = fs.readFileSync("js/viewer.js", "utf8");
const workflow = fs.readFileSync(".github/workflows/interface-preview.yml", "utf8");

test("CV exposes one complete and bounded product footer", () => {
  const matches = html.match(/<footer\b[\s\S]*?<\/footer>/g) || [];
  assert.equal(matches.length, 1);
  const footer = matches[0];
  assert.match(footer, /atlas-footer--product/);
  assert.match(footer, /aria-label="CV product footer"/);
  assert.match(footer, /atlas-footer__identity/);
  assert.match(footer, /atlas-footer__context/);
  assert.match(footer, /atlas-footer__evidence/);
  assert.match(footer, /atlas-footer__escape/);
  assert.match(footer, /Public engineering document viewer/);
  assert.match(footer, /Atlas Systems home/);
  assert.equal((footer.match(/<a\b/g) || []).length, 4);
  assert.doesNotMatch(footer, /Estate status/);
  assert.doesNotMatch(footer, /atlas-footer__sequence/);
});

test("footer presentation keeps a single underlined desktop rail and the v0.4.0 responsive contract", () => {
  assert.match(html, /phase-6-footer\.css\?v=20260730-phase-6-v2/);
  assert.match(css, /atlas-interface-kit v0\.4\.0/);
  assert.match(css, /\.cv-footer\s*\{[\s\S]*display: flex;/);
  assert.match(css, /flex-wrap: wrap/);
  assert.match(css, /margin: var\(--atlas-space-7, 48px\) auto 0/);
  assert.match(css, /padding: var\(--atlas-space-4, 16px\) var\(--atlas-space-5, 24px\)/);
  assert.match(css, /text-decoration: underline/);
  assert.match(css, /min-width: var\(--atlas-touch-min, 44px\)/);
  assert.match(css, /min-height: var\(--atlas-touch-min, 44px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /atlas-footer__sequence/);
});

test("CV indexing and explicit document controls remain unchanged", () => {
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.match(html, /id="init-btn"/);
  assert.match(html, /id="close-viewer"/);
  assert.match(html, /id="viewer-frame"/);
  assert.match(html, /href="\/Atlas_Reaper_System_Architect\.pdf"/);
  assert.match(html, /src="\/js\/viewer\.js\?v=20260724-interface-v2"/);
});

test("desktop embed, mobile handoff, and focus return remain viewer-owned", () => {
  assert.match(viewer, /object\.type = "application\/pdf"/);
  assert.match(viewer, /window\.location\.assign\(PDF_PATH\)/);
  assert.match(viewer, /closeButton\.focus\(\)/);
  assert.match(viewer, /initialise\.focus\(\)/);
  assert.match(viewer, /event\.key === "Escape"/);
});

test("CV preview provider writes require explicit approval", () => {
  assert.match(workflow, /types: \[opened, synchronize, reopened, labeled\]/);
  assert.match(workflow, /css\/phase-6-footer\.css/);
  assert.match(
    workflow,
    /contains\(github\.event\.pull_request\.labels\.\*\.name, 'interface-preview-approved'\)/,
  );
});
