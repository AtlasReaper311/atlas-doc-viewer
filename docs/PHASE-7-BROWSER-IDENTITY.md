# Phase 7 browser identity

## Finding

The CV landing page already satisfies the accepted product identity:

- `CV // Atlas Systems` title;
- `noindex, follow`;
- exact canonical URL;
- `og:type=profile`;
- route-specific social image and matching image alt text;
- complete local icon package and manifest;
- About active on desktop and mobile;
- repository-local interface assets.

The measured gap was unknown-route ownership. Without a committed `404.html`, missing paths depended on provider fallback behavior.

## Change

The CV now owns a noindex error surface with:

- `404 // CV // Atlas Systems` title;
- no canonical URL for an arbitrary missing path;
- no Open Graph or Twitter card;
- repository-local icon, manifest, font, interface, and footer assets;
- the existing About relationship;
- direct recovery to the deliberate CV gate;
- no PDF URL, initialization control, JavaScript, embed, download, or automatic document request.

## Protected boundaries

The change does not modify:

- the CV root or its metadata;
- explicit viewer initialization;
- desktop PDF embed;
- mobile native handoff;
- close and focus return;
- the local protected PDF;
- independent deployment;
- provider settings or secrets.

## Validation

The repository-native suite must prove the root profile metadata, error noindex contract, icon declarations, About active state, and absence of any protected document request path in the error page.

## Rollout boundary

This branch stops at a draft pull request. A later merge will trigger the independent CV Pages deployment and requires separate rollout approval and live verification.
