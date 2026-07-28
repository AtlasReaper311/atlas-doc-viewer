import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runner = readFileSync("scripts/capture-comparable-interface-evidence.mjs", "utf8");
const workflow = readFileSync(".github/workflows/interface-preview.yml", "utf8");

test("comparable CV evidence uses the shared schema and reporting matrix", () => {
  assert.ok(runner.includes('atlas-public-interface/evidence/v1'));
  assert.ok(runner.includes('["1920", 1920, 1080, "reporting-only"]'));
  assert.ok(runner.includes('browser_performance_mode: "reporting-only"'));
  assert.ok(runner.includes('"wcag22aa"'));
});

test("comparable CV evidence records browser, network, resource, and focus diagnostics", () => {
  assert.ok(runner.includes('page.on("pageerror"'));
  assert.ok(runner.includes('page.on("console"'));
  assert.ok(runner.includes('page.on("requestfailed"'));
  assert.ok(runner.includes('page.on("response"'));
  assert.ok(runner.includes('performance.getEntriesByType("resource")'));
  assert.ok(runner.includes('focus_visible'));
});

test("the CV preview publishes exact-head comparable evidence", () => {
  assert.ok(workflow.includes('PRODUCT_ID: atlas-doc-viewer'));
  assert.ok(workflow.includes('node capture-comparable-interface-evidence.mjs'));
  assert.ok(workflow.includes('comparable-evidence.json'));
  assert.ok(workflow.includes('document-viewer-evidence-${{ github.event.pull_request.head.sha }}'));
  assert.ok(workflow.includes('retention-days: 14'));
});
