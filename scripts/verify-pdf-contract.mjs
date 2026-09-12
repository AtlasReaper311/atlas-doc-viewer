import crypto from "node:crypto";
import fs from "node:fs";

const PDF_NAME = "Atlas_Reaper_System_Architect.pdf";
const EXPECTED_BYTES = 218122;
const EXPECTED_SHA256 =
  "e797c191802996802ed565fcdbf2951b805fc6ff8466d5a9783e8b2694c7577c";

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const pdf = fs.readFileSync(PDF_NAME);
const html = fs.readFileSync("index.html", "utf8");
const hash = crypto.createHash("sha256").update(pdf).digest("hex");

requireValue(
  pdf.byteLength === EXPECTED_BYTES,
  `protected PDF size changed: ${pdf.byteLength} bytes`,
);
requireValue(
  hash === EXPECTED_SHA256,
  `protected PDF SHA-256 changed: ${hash}`,
);
requireValue(pdf.subarray(0, 5).toString("ascii") === "%PDF-", "asset is not a PDF");
requireValue(html.includes(PDF_NAME), "viewer no longer references the protected PDF");
requireValue(
  html.includes('<meta name="robots" content="noindex, follow">'),
  "viewer indexing policy changed",
);
requireValue(
  html.includes("/assets/interface/v0.5.0/atlas-interface-kit.css"),
  "viewer does not load its repository-local pinned interface bundle",
);

console.log(
  `Protected PDF verified: ${PDF_NAME} / ${pdf.byteLength} bytes / ${hash}`,
);
