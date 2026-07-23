const ENDPOINT = "https://api.atlas-systems.uk/v1/search";
const MAX_RESULTS = 5;
let ui;
let previousFocus;
let request;
let debounce;

function hrefFor(hit) {
  const repo = String(hit.source_repo || hit.repo || "");
  const path = String(hit.file_path || hit.path || "");
  if (repo === "atlas-systems" && /\.html?$/i.test(path)) {
    return "https://atlas-systems.uk/" + path.replace(/^\/+/, "").replace(/index\.html?$/i, "");
  }
  if (repo && path) {
    return "https://github.com/AtlasReaper311/" + encodeURIComponent(repo) +
      "/blob/main/" + path.split("/").map(encodeURIComponent).join("/");
  }
  return null;
}

function excerpt(value) {
  const text = String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 220 ? text.slice(0, 220).replace(/\s+\S*$/, "") + "…" : text;
}

function build() {
  const root = document.createElement("div");
  root.className = "atlas-search-root";
  root.hidden = true;
  const scrim = document.createElement("button");
  scrim.type = "button";
  scrim.className = "atlas-search-scrim";
  scrim.setAttribute("aria-label", "Close estate search");
  const panel = document.createElement("section");
  panel.className = "atlas-search-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Search the Atlas Systems estate");
  const heading = document.createElement("p");
  heading.className = "atlas-search-heading";
  heading.textContent = "ATLAS ESTATE // search";
  const input = document.createElement("input");
  input.className = "atlas-search-input";
  input.type = "search";
  input.maxLength = 500;
  input.placeholder = "search the estate…";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Search query");
  const status = document.createElement("p");
  status.className = "atlas-search-status";
  status.setAttribute("aria-live", "polite");
  status.textContent = "type at least two characters";
  const results = document.createElement("ol");
  results.className = "atlas-search-results";
  const close = document.createElement("button");
  close.className = "atlas-search-close";
  close.type = "button";
  close.textContent = "Close";
  panel.append(heading, input, status, results, close);
  root.append(scrim, panel);
  document.body.appendChild(root);
  return { root, scrim, panel, input, status, results, close };
}

function render(data) {
  ui.results.replaceChildren();
  const hits = Array.isArray(data && data.hits) ? data.hits.slice(0, MAX_RESULTS) : [];
  if (!hits.length) {
    ui.status.textContent = "no matches in the public estate corpus";
    return;
  }
  for (const hit of hits) {
    const item = document.createElement("li");
    item.className = "atlas-search-result";
    const destination = hrefFor(hit);
    const main = document.createElement(destination ? "a" : "div");
    main.className = "atlas-search-result-main";
    if (destination) {
      main.href = destination;
      if (!new URL(destination).hostname.endsWith("atlas-systems.uk")) {
        main.target = "_blank";
        main.rel = "noopener noreferrer";
      }
    }
    const label = document.createElement("strong");
    label.textContent = String(hit.source_repo || hit.repo || "estate") + "/" + String(hit.file_path || hit.path || "document");
    const text = document.createElement("span");
    text.textContent = excerpt(hit.text || hit.excerpt || "");
    main.append(label, text);
    item.appendChild(main);
    ui.results.appendChild(item);
  }
  ui.status.textContent = `${hits.length} ${hits.length === 1 ? "result" : "results"}`;
}

async function search(query) {
  if (request) request.abort();
  request = new AbortController();
  const timeout = window.setTimeout(() => request.abort(), 8_000);
  ui.status.textContent = "searching…";
  try {
    const url = new URL(ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("top_k", String(MAX_RESULTS));
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, signal: request.signal });
    if (response.status === 429) {
      ui.results.replaceChildren();
      ui.status.textContent = "search rate limit reached; try again shortly";
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
  } catch (error) {
    if (error && error.name === "AbortError") return;
    ui.results.replaceChildren();
    ui.status.textContent = "estate search unavailable";
  } finally {
    window.clearTimeout(timeout);
  }
}

function open(trigger) {
  previousFocus = trigger || document.activeElement;
  ui.root.hidden = false;
  document.body.classList.add("atlas-search-open");
  ui.input.focus();
  ui.input.select();
}

function close() {
  if (request) request.abort();
  ui.root.hidden = true;
  document.body.classList.remove("atlas-search-open");
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}

function trap(event) {
  const controls = Array.from(ui.panel.querySelectorAll("a[href], button, input")).filter((node) => !node.disabled);
  if (!controls.length) return;
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function installEstateSearch() {
  ui = build();
  document.querySelectorAll("[data-estate-search-open]").forEach((trigger) => trigger.addEventListener("click", () => open(trigger)));
  ui.scrim.addEventListener("click", close);
  ui.close.addEventListener("click", close);
  ui.panel.addEventListener("keydown", (event) => {
    if (event.key === "Tab") trap(event);
  });
  ui.input.addEventListener("input", () => {
    const query = ui.input.value.trim();
    if (debounce) window.clearTimeout(debounce);
    if (query.length < 2) {
      if (request) request.abort();
      ui.results.replaceChildren();
      ui.status.textContent = query ? "keep typing…" : "type at least two characters";
      return;
    }
    debounce = window.setTimeout(() => void search(query), 250);
  });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && !event.altKey && key === "k") {
      event.preventDefault();
      open(document.activeElement);
    } else if (key === "escape" && !ui.root.hidden) {
      close();
    }
  });
}
