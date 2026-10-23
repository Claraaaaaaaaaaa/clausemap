# SCOPE V0.9 — GitHub Pages Preview

The website at **https://claraaaaaaaaaaa.github.io/clausemap/scope/** is a static, browser-only adaptation of the original SCOPE V0.9 Studio / Client interface from the owner's uploaded **SCOPE_V09_Live_Shared_MVP(2).zip**.

## What stays the same

- The original V0.9 HTML, layout, CSS, typography, Studio and Client panels, and negotiation sliders are preserved.
- The original studio/client link-based role separation and proposal/counterproposal/approval interactions remain in place.
- The page supports switching English / Simplified Chinese.

## Critical limitation

**GitHub Pages does not run the original Python FastAPI / SQLite server.** This preview substitutes the four API operations with browser `localStorage` (same browser origin only). It is useful for **single-browser / multiple-tab interactive evaluation**, not for genuinely sharing a proposal across devices. A copied client link opened in a different browser or on another device will not find the data.

No login, identity verification, contract signing, payment or secure production approval is provided. Nothing here constitutes a legally binding signature. Do not put confidential client information into a public/shared demo.

The full original API backend remains in the user's original ZIP and requires separate cloud hosting plus persistence for genuine cross-device collaboration.

## How to test the interaction

1. Open the public URL and review the original dark Studio page.
2. Edit the new work, additional price and delivery delay. Publish the proposal.
3. Open the generated client link **in a new tab of the same browser**. The light Client page includes three sliders.
4. Submit a counterproposal; return to the Studio tab, click Refresh, and review it.
5. Adopt and republish; refresh the Client tab to see the new version, then accept.

## Provenance

Source: original uploaded V0.9 project (October 23, 2026). The GitHub Pages adaptation preserves its page structure and styles. Only the runtime API is swapped and status text is changed to accurately say "browser preview." This is not a standalone hackathon submission repository; creating one separately may still be necessary.
