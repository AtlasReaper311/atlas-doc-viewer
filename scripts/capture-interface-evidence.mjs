import fs from "node:fs";
import process from "node:process";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.env.PREVIEW_URL;
const commit = process.env.HEAD_SHA || "local";

if (!base) throw new Error("PREVIEW_URL is required");

const viewports = [
  { name: "320", width: 320, height: 760 },
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 900 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];
const report = {
  schema: "atlas-doc-viewer/interface-evidence/v1",
  commit,
  preview: base,
  cases: [],
  failures: [],
};

fs.mkdirSync("screenshots", { recursive: true });

async function openWithRetry(page) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await page.goto(new URL("/", base).toString(), {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      await page.waitForSelector("#gate-title", { timeout: 10_000 });
      await page.evaluate(() => document.fonts?.ready || Promise.resolve());
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(1_000 * (attempt + 1));
    }
  }
  throw lastError;
}

async function inspectOpening(page, pdfRequests) {
  return page.evaluate((requestCount) => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      const bounds = element?.getBoundingClientRect();
      return bounds ? {
        top: Math.round(bounds.top),
        bottom: Math.round(bounds.bottom),
        left: Math.round(bounds.left),
        right: Math.round(bounds.right),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      } : null;
    };
    const displayed = (selector) => {
      const element = document.querySelector(selector);
      return Boolean(element && getComputedStyle(element).display !== "none");
    };
    const controls = [...document.querySelectorAll(
      "a[href], button, input, [tabindex]",
    )]
      .filter((element) => {
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return bounds.width > 0 && bounds.height > 0 &&
          style.visibility !== "hidden" && style.display !== "none";
      })
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") ||
            element.textContent.trim().replace(/\s+/g, " ").slice(0, 80),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
      });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      mainCount: document.querySelectorAll("main").length,
      h1Count: document.querySelectorAll("h1").length,
      title: document.querySelector("h1")?.textContent.trim(),
      headerRoutes: [...document.querySelectorAll(
        ".atlas-global-header__nav a",
      )].map((anchor) => anchor.textContent.trim()),
      bottomRoutes: [...document.querySelectorAll(
        ".atlas-bottom-nav a",
      )].map((anchor) => anchor.textContent.trim()),
      bottomNavDisplayed: displayed(".atlas-bottom-nav"),
      gate: rect("#gate"),
      viewerHidden: document.querySelector("#viewer")?.hidden,
      productStrip: rect(".cv-product-strip"),
      documentDossier: rect(".document-dossier"),
      pdfRequests: requestCount,
      targetFailures: controls.filter(
        (control) => control.width < 44 || control.height < 44,
      ),
    };
  }, pdfRequests);
}

async function exerciseSearch(page) {
  const trigger = page.locator("[data-estate-search-open]").first();
  await trigger.click();
  await page.waitForSelector(".atlas-search-root:not([hidden])");
  const inputFocused = await page.evaluate(
    () => document.activeElement?.classList.contains("atlas-search-input"),
  );
  await page.keyboard.press("Escape");
  await page.waitForSelector(".atlas-search-root", { state: "hidden" });
  const focusRestored = await page.evaluate(
    () => document.activeElement?.hasAttribute("data-estate-search-open"),
  );
  return { inputFocused, focusRestored };
}

async function exerciseViewer(page) {
  await page.locator("#init-btn").click();
  await page.waitForSelector("#viewer:not([hidden])");
  await page.waitForSelector("#viewer-frame object");
  const opened = await page.evaluate(() => ({
    gateHidden: document.querySelector("#gate")?.hidden,
    viewerHidden: document.querySelector("#viewer")?.hidden,
    objectData: document.querySelector("#viewer-frame object")?.getAttribute("data"),
    objectType: document.querySelector("#viewer-frame object")?.getAttribute("type"),
    focus: document.activeElement?.id,
    state: document.querySelector(".cv-document-state")?.dataset.state,
    stateText: document.querySelector(".cv-document-state")?.textContent.trim(),
  }));
  await page.keyboard.press("Escape");
  await page.waitForSelector("#gate:not([hidden])");
  const closed = await page.evaluate(() => ({
    gateHidden: document.querySelector("#gate")?.hidden,
    viewerHidden: document.querySelector("#viewer")?.hidden,
    objectCount: document.querySelectorAll("#viewer-frame object").length,
    focus: document.activeElement?.id,
    state: document.querySelector(".cv-document-state")?.dataset.state,
  }));
  return { opened, closed };
}

function assertCase(item) {
  const prefix = `${item.browser}/${item.viewport}`;
  const expectedRoutes = ["Work", "Writing", "Lab", "Systems", "About"];
  const failures = [];
  if (item.opening.scrollWidth > item.opening.viewport.width + 1) {
    failures.push(`${prefix}: horizontal overflow`);
  }
  if (item.opening.mainCount !== 1 || item.opening.h1Count !== 1) {
    failures.push(`${prefix}: landmark or principal-heading count drifted`);
  }
  if (item.opening.title !== "Atlas Reaper.") {
    failures.push(`${prefix}: document title drifted`);
  }
  if (
    JSON.stringify(item.opening.headerRoutes) !==
    JSON.stringify(expectedRoutes)
  ) {
    failures.push(`${prefix}: desktop route order drifted`);
  }
  if (
    JSON.stringify(item.opening.bottomRoutes) !==
    JSON.stringify(expectedRoutes)
  ) {
    failures.push(`${prefix}: mobile route order drifted`);
  }
  const mobile = Number(item.viewport) < 768;
  if (item.opening.bottomNavDisplayed !== mobile) {
    failures.push(`${prefix}: mobile bottom-navigation state is incorrect`);
  }
  if (!item.opening.viewerHidden) {
    failures.push(`${prefix}: viewer was loaded before the visitor requested it`);
  }
  if (item.opening.pdfRequests !== 0) {
    failures.push(`${prefix}: protected PDF was requested during the opening gate`);
  }
  if (!item.search.inputFocused || !item.search.focusRestored) {
    failures.push(`${prefix}: search focus contract failed`);
  }
  if (item.opening.targetFailures.length) {
    failures.push(
      `${prefix}: controls below 44px ${JSON.stringify(item.opening.targetFailures)}`,
    );
  }
  if (item.pageErrors.length) {
    failures.push(`${prefix}: page errors ${JSON.stringify(item.pageErrors)}`);
  }
  if (item.seriousAccessibility.length) {
    failures.push(
      `${prefix}: serious accessibility findings ${JSON.stringify(item.seriousAccessibility)}`,
    );
  }
  if (item.viewer) {
    const { opened, closed } = item.viewer;
    if (
      !opened.gateHidden || opened.viewerHidden ||
      opened.objectData !== "/Atlas_Reaper_System_Architect.pdf" ||
      opened.objectType !== "application/pdf" ||
      opened.focus !== "close-viewer" ||
      opened.state !== "active"
    ) {
      failures.push(`${prefix}: desktop viewer open contract failed`);
    }
    if (
      closed.gateHidden || !closed.viewerHidden ||
      closed.objectCount !== 0 || closed.focus !== "init-btn" ||
      closed.state !== "ready"
    ) {
      failures.push(`${prefix}: desktop viewer close contract failed`);
    }
  }
  return failures;
}

async function runCase(browser, browserName, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  const pageErrors = [];
  let pdfRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(
      "/Atlas_Reaper_System_Architect.pdf",
    )) {
      pdfRequests += 1;
    }
  });

  try {
    await openWithRetry(page);
    const opening = await inspectOpening(page, pdfRequests);
    await page.screenshot({
      path: `screenshots/${browserName}-${viewport.name}-opening.png`,
      fullPage: viewport.width >= 768,
    });

    const search = await exerciseSearch(page);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const seriousAccessibility = accessibility.violations
      .filter((item) => item.impact === "serious" || item.impact === "critical")
      .map((item) => ({ id: item.id, impact: item.impact, surface: "opening" }));

    let viewer = null;
    let viewerAccessibilityViolations = [];
    if (viewport.width >= 1024) {
      viewer = await exerciseViewer(page);
      await page.locator("#init-btn").click();
      await page.waitForSelector("#viewer:not([hidden])");
      const viewerAccessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      viewerAccessibilityViolations = viewerAccessibility.violations;
      seriousAccessibility.push(
        ...viewerAccessibility.violations
          .filter(
            (item) => item.impact === "serious" || item.impact === "critical",
          )
          .map((item) => ({
            id: item.id,
            impact: item.impact,
            surface: "viewer",
          })),
      );
      await page.screenshot({
        path: `screenshots/${browserName}-${viewport.name}-viewer.png`,
        fullPage: false,
      });
    }

    const item = {
      browser: browserName,
      viewport: viewport.name,
      opening,
      search,
      viewer,
      pageErrors,
      seriousAccessibility,
      accessibilityViolations: accessibility.violations,
      viewerAccessibilityViolations,
    };
    const failures = assertCase(item);
    report.cases.push(item);
    report.failures.push(...failures);
  } finally {
    await context.close();
  }
}

try {
  for (const [name, launcher] of [
    ["chrome", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await launcher.launch();
    try {
      for (const viewport of viewports) {
        await runCase(browser, name, viewport);
      }
    } finally {
      await browser.close();
    }
  }
  fs.writeFileSync("evidence.json", JSON.stringify(report, null, 2));
  if (report.failures.length) {
    throw new Error(report.failures.join("\n"));
  }
  console.log(`Captured ${report.cases.length} document-viewer evidence cases.`);
} catch (error) {
  fs.writeFileSync(
    "capture-error.txt",
    `${error.stack || error.message || error}\n`,
  );
  fs.writeFileSync("evidence.json", JSON.stringify(report, null, 2));
  throw error;
}
