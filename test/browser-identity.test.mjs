import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const home = fs.readFileSync("index.html", "utf8");
const notFound = fs.readFileSync("404.html", "utf8");

function assertIcons(html) {
  for (const href of [
    "/favicon.ico",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/apple-touch-icon.png",
    "/site.webmanifest",
  ]) {
    assert.match(html, new RegExp(`href="${href.replaceAll("/", "\\/")}"`));
  }
}

test("CV root preserves profile metadata and indexing policy", () => {
  assert.match(home, /<title>CV \/\/ Atlas Systems<\/title>/);
  assert.match(home, /name="robots" content="noindex, follow"/);
  assert.match(home, /<link rel="canonical" href="https:\/\/cv\.atlas-systems\.uk\/">/);
  assert.match(home, /property="og:type" content="profile"/);
  assert.match(home, /property="og:url" content="https:\/\/cv\.atlas-systems\.uk\/"/);
  assert.match(home, /property="og:image" content="https:\/\/atlas-systems\.uk\/og\/cv\.png"/);
  assert.match(home, /name="twitter:image" content="https:\/\/atlas-systems\.uk\/og\/cv\.png"/);
  assert.match(home, /name="twitter:image:alt" content="Atlas Reaper: engineering CV\. \/\/ Atlas Systems"/);
  assertIcons(home);
});

test("CV owns a noindex error route without loading the protected document", () => {
  assert.match(notFound, /<title>404 \/\/ CV \/\/ Atlas Systems<\/title>/);
  assert.match(notFound, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(notFound, /rel="canonical"/);
  assert.doesNotMatch(notFound, /property="og:/);
  assert.doesNotMatch(notFound, /name="twitter:/);
  assert.doesNotMatch(notFound, /Atlas_Reaper_System_Architect\.pdf/);
  assert.doesNotMatch(notFound, /Initialize PDF/);
  assert.doesNotMatch(notFound, /<script/);
  assert.match(notFound, /href="\/">Open CV gate<\/a>/);
  assert.match(notFound, /aria-current="page">About<\/a>/);
  assertIcons(notFound);
});
