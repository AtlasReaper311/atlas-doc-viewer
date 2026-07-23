const PDF_PATH = "/Atlas_Reaper_System_Architect.pdf";
const MOBILE_QUERY = window.matchMedia("(max-width: 899px)");

const gate = document.getElementById("gate");
const viewer = document.getElementById("viewer");
const frame = document.getElementById("viewer-frame");
const initialise = document.getElementById("init-btn");
const closeButton = document.getElementById("close-viewer");
const announcer = document.getElementById("viewer-announcer");

function isMobileViewer() {
  return MOBILE_QUERY.matches || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

function fallbackContent() {
  const wrapper = document.createElement("div");
  wrapper.className = "viewer-fallback";
  const text = document.createElement("p");
  text.textContent = "Inline PDF rendering is unavailable in this browser.";
  const link = document.createElement("a");
  link.className = "secondary-action";
  link.href = PDF_PATH;
  link.download = "Atlas_Reaper_System_Architect.pdf";
  link.textContent = "Download PDF";
  wrapper.append(text, link);
  return wrapper;
}

function buildPdfObject() {
  const object = document.createElement("object");
  object.data = PDF_PATH;
  object.type = "application/pdf";
  object.setAttribute("aria-label", "Atlas Reaper System Architect CV");
  object.appendChild(fallbackContent());
  return object;
}

export function initialiseViewer() {
  if (isMobileViewer()) {
    window.location.assign(PDF_PATH);
    return;
  }

  frame.replaceChildren(buildPdfObject());
  gate.hidden = true;
  viewer.hidden = false;
  announcer.textContent = "CV viewer opened.";
  viewer.scrollIntoView({ block: "start", behavior: "auto" });
  closeButton.focus();
}

export function closeViewer() {
  frame.replaceChildren();
  viewer.hidden = true;
  gate.hidden = false;
  announcer.textContent = "CV viewer closed.";
  gate.scrollIntoView({ block: "start", behavior: "auto" });
  initialise.focus();
}

initialise.addEventListener("click", initialiseViewer);
closeButton.addEventListener("click", closeViewer);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !viewer.hidden) {
    event.preventDefault();
    closeViewer();
  }
});
