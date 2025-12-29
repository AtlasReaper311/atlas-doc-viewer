# Atlas Document Viewer

A lightweight, rigorous HTML wrapper designed for securely displaying static PDF assets across varied device topologies.

## 🚀 The Problem
Standard mobile browsers (iOS Safari / Android Chrome) lack native embedded PDF engines. When a user navigates to a static PDF link, the browser behavior is inconsistent—often forcing a download immediately or displaying a blank render. 

For professional portfolios and technical documentation, this creates a fragmented user experience.

## 🛠 The Solution
**Atlas Doc Viewer** acts as a user-agent-aware middleware layer:

* **Desktop Topology:** Renders the PDF in a full-screen, borderless `iframe` for immediate viewing.
* **Mobile Topology:** Detects viewport constraints via CSS media queries (`@media screen and (max-width: 900px)`) and serves a touch-optimized "Initialization" interface.
* **Aesthetics:** Dark-mode native, matte-black styling to reduce glare and focus attention on the asset.

## 💻 Tech Stack
* **Core:** HTML5, CSS3 (Flexbox)
* **Logic:** CSS-based State Switching (No heavy JavaScript required)
* **Deployment:** Optimized for Cloudflare Pages / Netlify / Vercel

## 📦 Usage
1. Drop `index.html` into your root directory.
2. Place your target file (e.g., `resume.pdf`) in the same folder.
3. Update the `href` and `src` attributes in the code to match your filename.
4. Deploy.

---
*Maintained by Atlas Systems.*
