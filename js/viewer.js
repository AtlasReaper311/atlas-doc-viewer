const PDF_PATH = "/Atlas_Reaper_System_Architect.pdf";
const MOBILE_QUERY = window.matchMedia("(max-width: 899px)");

const gate = document.getElementById("gate");
const viewer = document.getElementById("viewer");
const frame = document.getElementById("viewer-frame");
const initialise = document.getElementById("init-btn");
const closeButton = document.getElementById("close-viewer");
const announcer = document.getElementById("viewer-announcer");
const documentState = document.querySelector(".cv-document-state");

function setDocumentState(label, active) {
  if (!documentState) return;
  const marker = documentState.querySelector("span");
  documentState.lastChild.textContent = label;
  documentState.dataset.state = active ? "active" : "ready";
  if (marker) marker.setAttribute("aria-hidden", "true");
}

function isMobileViewer() {
  return MOBILE_QUERY.matches || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

function buildPdfFrame() {
  const pdfFrame = document.createElement("iframe");
  pdfFrame.src = PDF_PATH;
  pdfFrame.title = "Atlas Reaper System Architect CV";
  pdfFrame.setAttribute("aria-label", "Atlas Reaper System Architect CV");
  return pdfFrame;
}

export function initialiseViewer() {
  if (isMobileViewer()) {
    window.location.assign(PDF_PATH);
    return;
  }

  frame.replaceChildren(buildPdfFrame());
  gate.hidden = true;
  viewer.hidden = false;
  setDocumentState("Viewer active", true);
  announcer.textContent = "CV viewer opened.";
  viewer.scrollIntoView({ block: "start", behavior: "auto" });
  closeButton.focus();
}

export function closeViewer() {
  frame.replaceChildren();
  viewer.hidden = true;
  gate.hidden = false;
  setDocumentState("Ready", false);
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
