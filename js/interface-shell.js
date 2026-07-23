import { STATUS_ENDPOINT, parseEstateStatus } from "./estate-status.js";
import { installEstateSearch } from "./estate-search.js";

const ATLAS_HOSTS = new Set([
  "api.atlas-systems.uk",
  "atlas-systems.uk",
  "cv.atlas-systems.uk",
  "ramone.atlas-systems.uk",
  "status.atlas-systems.uk",
]);

function setStatus(chip, result) {
  chip.dataset.state = result.state;
  chip.querySelector(".estate-status-label").textContent = result.state;
  chip.setAttribute("aria-label", `Atlas Systems status: ${result.state}`);
  chip.title = result.detail;
}

async function refreshStatus() {
  const chip = document.querySelector(".estate-status");
  if (!chip) return;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6_000);
  try {
    const response = await fetch(STATUS_ENDPOINT, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setStatus(chip, parseEstateStatus(await response.json()));
  } catch {
    setStatus(chip, { state: "unknown", detail: "Status evidence could not be loaded." });
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeLink(anchor) {
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download")) return;
  const raw = anchor.getAttribute("href") || "";
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
  let url;
  try { url = new URL(anchor.href, window.location.href); } catch { return; }
  if (!/^https?:$/.test(url.protocol)) return;
  if (ATLAS_HOSTS.has(url.hostname)) {
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  } else {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
}

function normalizeLinks(root = document) {
  root.querySelectorAll("a[href]").forEach(normalizeLink);
}

function observeLinks() {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches("a[href]")) normalizeLink(node);
        normalizeLinks(node);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function install() {
  normalizeLinks();
  observeLinks();
  installEstateSearch();
  void refreshStatus();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  install();
}
