---
doc: prd
status: draft
---

# SCOPE — Product Requirements

Source: [scope.md](./scope.md), particularly “The Core Loop”, “What Working Means”, and “Proof-of-Concept Boundary.”

## Product promise

Give both sides of a scope change a concrete, editable view of the relationship among new work, increased price, and changed timing. Avoid positioning the demo as a contract-signing or production multi-user system.

## Core Journey

1. **Studio initial view:** show the original project baseline, new request title/description, added work, fee, and delivery controls.
2. **Recalculate:** adjusting extra work updates the displayed recommendations for fee and delivery. Studio can alter proposed fee or timing; display the chosen result prominently.
3. **Publish:** Studio creates a browser-local proposal and receives distinct Studio and Client links.
4. **Client review:** a Client tab in the same browser opens its role-specific URL, shows the original and changed terms, and provides controlled ways to test alternative price, workload, and time.
5. **Client response:** Client can accept, decline, or send a counterproposal with optional text.
6. **Studio revision:** Studio refreshes the locally stored state; a counterproposal can be reviewed and adopted into a revised published offer.
7. **Confirmation:** both views show the relevant published version and response state.

## Look and feel — approved V0.9 visual baseline

- Studio: near-black background, pink accents, large expressive display typography.
- Client: light surface, same display-font family, supporting typography consistent with Studio.
- English-only text.
- Keep final reduced header and pricing sizes and stretched headline appearance. No new themes or design redesign during submission preparation.
- Buttons and sliders must remain visually associated with the values they change.

## Features and Behaviors

### Studio proposal composition

- Edit baseline assumptions and scope-change description where available.
- Model extra hours and their fee/time effect.
- Keep manually adjusted fee and delivery choices distinct from automatic recommendations.
- Publish a version; display browser-local sharing URLs and a status notice.

### Client evaluation

- Display the published offer, not an unsubmitted Studio draft.
- Permit the client to explore the workload, price, and delivery tradeoff.
- Offer budget/time-fitting actions, reset to Studio proposal, and a counterproposal response.

### Proposal state and feedback

- Store proposal and response through the browser-local API emulation in `localStorage`.
- Reflect publish, counterproposal, accept, decline, and refresh states in interface messages.
- Preserve role separation through distinct query parameters for Studio and Client.
- Handle missing and invalid sessions with visible feedback; never claim live cloud sync.

## Expected Environment and Boundaries

- Modern desktop browser, GitHub Pages host, browser storage available.
- A second tab from the **same browser**, not another device, is required for the functional shared-state demonstration.
- Public links contain local role identifiers, but **they are not secure authentication**.
- This is a negotiation visualization, not legal, financial, or operational contract enforcement.

## Acceptance Criteria

- Publishing from Studio produces a visible version and a Client URL.
- In a second tab in the same browser, Client can see the published terms.
- Client can submit a counterproposal and Studio can observe it after refresh.
- Client can accept or decline an available proposal and see an appropriate confirmation.
- UI remains English-only with the accepted typography/layout.
- A new browser or device is **not** promised to recover the stored proposal.

## Deferred

Hosted FastAPI/SQLite or alternative shared backend, authentication, audit trails, production security, notification service, and legally binding approvals.

## Document status

Retrospective draft aligned to the already accepted UI. It is not evidence of a pre-build Skill Pack interview or of completed video/submission requirements.
