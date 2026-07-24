import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const expected = [
  "Contact: mailto:atlas@atlas-systems.uk",
  "Expires: 2027-07-24T23:59:59Z",
  "Preferred-Languages: en",
  "Canonical: https://cv.atlas-systems.uk/.well-known/security.txt",
];

test("CV publishes the approved security contact at the standard route", () => {
  const lines = fs.readFileSync(".well-known/security.txt", "utf8").trim().split("\n");
  assert.deepEqual(lines, expected);
});

test("CV security metadata remains inside the Pages response policy", () => {
  const headers = fs.readFileSync("_headers", "utf8");
  assert.match(headers, /^\/\*$/m);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: no-referrer/);
});
