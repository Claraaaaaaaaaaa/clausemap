# SCOPE V0.9 — Studio / Client Negotiation Prototype

**Live demo:** https://claraaaaaaaaaaa.github.io/clausemap/scope/

**Source:** [index.html](./index.html) — a single, self-contained HTML/CSS/JavaScript page.

SCOPE visualizes how a proposed scope change affects a service project's **additional work, price, and delivery time**, then allows a client to review, negotiate, and accept or decline an offer.

## Current experience

1. Start in **Studio** with an example project, edit the added work, price, and delivery delay, and publish a proposal.
2. Copy the generated **Client** link and open it in another tab **in the same browser**.
3. From Client, inspect the proposal; adjust the additional work, pricing, or delivery timeline; and send a counterproposal, accept, or decline.
4. Return to Studio, refresh the state, adopt a counterproposal if desired, and republish.

Both screens are English-only. The dark, pink-accented Studio and lighter Client views retain the final V0.9 typography and layout. The local pricing and scheduling display derives recommendations from the example's baseline fee, work estimate, and planned duration; the Studio may override suggestions.

## Important technical boundary

**The GitHub Pages version is a browser-only demonstration.** It simulates the original application's API requests using `localStorage` in the current browser origin. Studio and Client tabs in that same browser can share proposal data, but **copied links will not synchronize between devices or unrelated browsers**. This is not a production collaboration backend.

This demo has no user accounts, payment handling, legally binding contract signature, or identity verification. Do not include sensitive client information.

The original V0.9 upload included a Python FastAPI / SQLite backend, which is **not deployed by GitHub Pages and is not part of this single-page hosted demo**. This README describes what reviewers can actually try on the public URL.

## Try it

Open the live demo above on a modern desktop browser. No installation, API key, or login is needed. To open the source locally, serve `index.html` with any static HTTP server; the hosted GitHub Pages link is the simplest evaluation route. The browser may need storage access enabled for the multi-tab state demo.

## Hackathon planning and submission status

SCOPE-specific planning artifacts are in [devpost/](./devpost/):

- [scope.md](./devpost/scope.md)
- [prd.md](./devpost/prd.md)
- [spec.md](./devpost/spec.md)
- [checklist.md](./devpost/checklist.md)

The other `/devpost/` folder at this repository's root belongs to a **different application, ClauseMap**. Do not confuse those documents with SCOPE's.

**Submission not yet certified:** These SCOPE planning documents were reconstructed from the approved V0.9 prototype and the product decisions; they are not evidence that the complete Devpost Learn Skill Pack sequence was run on this SCOPE project. The required publicly hosted demonstration video and actual Devpost entry must also be completed.

Official contest rules: https://learn-ai-basics.devpost.com/rules
