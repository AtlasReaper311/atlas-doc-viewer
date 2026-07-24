import crypto from "node:crypto";
import fs from "node:fs";

const PDF_NAME = "Atlas_Reaper_System_Architect.pdf";
const EXPECTED_BYTES = 233956;
const EXPECTED_SHA256 =
  "8740f30de204ef8f18275c95a1c1abe1d975c60ae4d46dc6710e96868562fc88";

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const pdf = fs.readFileSync(PDF_NAME);
const html = fs.readFileSync("index.html", "utf8");
const hash = crypto.createHash("sha256").update(pdf).digest("hex");

requireValue(pdf.byteLength === EXPECTED_BYTES, "protected PDF size changed");
requireValue(hash === EXPECTED_SHA256, "protected PDF SHA-256 changed");
requireValue(pdf.subarray(0, 5).toString("ascii") === "%PDF-", "asset is not a PDF");
requireValue(html.includes(PDF_NAME), "viewer no longer references the protected PDF");
requireValue(
  html.includes('<meta name="robots" content="noindex, follow">'),
  "viewer indexing policy changed",
);
requireValue(
  html.includes("/assets/interface/v0.1.1/atlas-interface-kit.css"),
  "viewer does not load its repository-local pinned interface bundle",
);

console.log(
  `Protected PDF verified: ${PDF_NAME} / ${pdf.byteLength} bytes / ${hash}`,
);
