import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  STATUS_ENDPOINT,
  STATUS_STALE_AFTER_MS,
  parseEstateStatus,
} from "../js/estate-status.js";

const html = fs.readFileSync("index.html", "utf8");
const NOW = Date.parse("2026-07-23T08:00:00Z");
const snapshot = (operational, total, checkedAt = "2026-07-23T07:55:00Z") => ({
  estate: { operational, total_components: total, checked_at: checkedAt },
});

test("CV gate and document identity remain present", () => {
  assert.match(html, />Initialize PDF</);
  assert.match(html, /Atlas_Reaper_System_Architect\.pdf/);
  assert.match(html, /id="gate"/);
  assert.match(html, /id="viewer"/);
  assert.match(html, /download="Atlas_Reaper_System_Architect\.pdf"/);
});

test("CV indexing policy is noindex, follow", () => {
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.doesNotMatch(html, /noindex, nofollow/);
});

test("global navigation, search, metadata, and local icon declarations are complete", () => {
  for (const route of ["/work/", "/writing/", "/lab/", "/about/"]) {
    assert.ok(html.includes(`https://atlas-systems.uk${route}`));
  }
  assert.match(html, /data-estate-search-open/);
  assert.match(html, /rel="canonical" href="https:\/\/cv\.atlas-systems\.uk\/"/);
  assert.match(html, /property="og:image:alt"/);
  assert.match(html, /rel="apple-touch-icon"/);
  assert.match(html, /rel="manifest"/);
});

test("Atlas-owned links do not open new tabs", () => {
  const owned = html.matchAll(/<a\b[^>]*href="https:\/\/[^\"]*atlas-systems\.uk[^\"]*"[^>]*>/g);
  for (const match of owned) {
    assert.doesNotMatch(match[0], /target="_blank"/);
  }
});

test("gate no longer invents an online operational state", () => {
  assert.doesNotMatch(html, /System Status:\s*<span[^>]*>ONLINE/i);
  assert.doesNotMatch(html, /status-dot-green/);
});

test("status mapping is bounded, fresh, and fail-closed", () => {
  assert.equal(STATUS_ENDPOINT, "https://api.atlas-systems.uk/v1/stats");
  assert.equal(STATUS_STALE_AFTER_MS, 1_200_000);
  assert.equal(parseEstateStatus(snapshot(19, 19), NOW).state, "nominal");
  assert.equal(parseEstateStatus(snapshot(18, 19), NOW).state, "degraded");
  assert.equal(parseEstateStatus(snapshot(9, 19), NOW).state, "unavailable");
  assert.equal(parseEstateStatus(snapshot(20, 19), NOW).state, "unknown");
  assert.equal(parseEstateStatus(snapshot(19, 19, "2026-07-23T07:39:59Z"), NOW).state, "unknown");
});

test("viewer uses class and hidden-state transitions with bounded announcements", () => {
  const viewer = fs.readFileSync("js/viewer.js", "utf8");
  assert.match(viewer, /gate\.hidden = true/);
  assert.match(viewer, /viewer\.hidden = false/);
  assert.match(viewer, /announcer\.textContent = "CV viewer opened\."/);
  assert.match(viewer, /announcer\.textContent = "CV viewer closed\."/);
  assert.doesNotMatch(viewer, /style\./);
  assert.doesNotMatch(viewer, /innerHTML/);
});

test("estate search is local and uses the public edge", () => {
  const search = fs.readFileSync("js/estate-search.js", "utf8");
  assert.match(search, /https:\/\/api\.atlas-systems\.uk\/v1\/search/);
  assert.doesNotMatch(search, /corpus\.atlas-systems\.uk/);
  assert.match(search, /aria-modal", "true"/);
  assert.match(search, /noopener noreferrer/);
});

test("visual interaction contract includes focus and reduced motion", () => {
  const css = fs.readFileSync("css/cv.css", "utf8");
  assert.match(css, /outline: 2px solid var\(--accent\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /--text-dim: #aaa9a0/);
});
