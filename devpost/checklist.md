---
doc: checklist
status: approved
---

# ClauseMap Build Checklist

Build mode: fast

## Slices

- [x] **1. A real public repository produces its first inspectable observation**
  Becomes usable: A minimal running app accepts a GitHub URL and reports the actual public-repository observation with source and time. The same first slice leaves a reproducible real-browser probe record for metadata → default-branch commit SHA → matching recursive tree SHA, including observed CORS and error behavior.
  Why now: This is the approved architecture's critical risk and the first part of ClauseMap's evidence kernel. Vite/React/TypeScript bootstrapping happens here, inside the first usable slice; no visual polish precedes the probe.
  PRD ref: `prd.md > The Core Journey` (steps 1–2), `prd.md > GitHub URL entry and first use`, `prd.md > Live inspection and graphical overview`
  Spec ref: `spec.md > GitHubClient`, `spec.md > RepositoryInput`, `spec.md > External Services and Dependencies`, `spec.md > Test Strategy and Implementation Order`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Run and record a real-browser anonymous GitHub API probe first. If it succeeds, scaffold Vite/React/TypeScript, implement strict URL parsing and the three-stage, commit-pinned GitHub client, and render a minimal live repository result. Show real failures as Unable to verify; do not use prototype results as fallback.
  Verify (mechanical): Record browser-origin, HTTP statuses, CORS outcome, canonical repo/default branch, commit SHA, requested/returned tree SHA, `truncated`, and a 404 result from actual network responses. Run a real public-repo check in the app and inspect its evidence; run the TypeScript/Vite build. Stop if the browser probe disproves the architecture.
  Learner check: Open the local app, enter a public GitHub repo URL, and inspect the repository observation; tell me whether the result and provenance are understandable.
  Commit: `Add live commit-pinned GitHub inspection foundation`

- [x] **2. The report distinguishes found, missing, and unverified planning files**
  Becomes usable: Enter a repository URL and see four evidence-backed machine findings; open a finding to see the exact observation, pinned path or tree, official rule, limitation, and next action. A real recheck replaces findings from a fresh request and cannot be overwritten by an older response.
  Why now: This completes the unique kernel before visual refinement. The file decision rules are most valuable when their evidence can be inspected immediately.
  PRD ref: `prd.md > Live inspection and graphical overview`, `prd.md > Five status meanings`, `prd.md > Evidence Inspector and rule provenance`, `prd.md > Recheck and changed evidence`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > InspectionEngine`, `spec.md > RuleCatalog and EvidenceBuilder`, `spec.md > InspectionController`, `spec.md > EvidenceInspector`, `spec.md > Data Model and State Transitions`, `spec.md > Important Failure Modes`
  Build: Implement regular-file matching in any subdirectory, complete-tree Missing threshold, partial-tree independent presence, typed GitHub failures, static official rule catalog, machine evidence detail, and generation-guarded fresh recheck. Add focused fixture tests for these trust boundaries. Keep fixture responses in tests only.
  Verify (mechanical): Run tests for complete presence/absence, nested files, truncation, SHA mismatch, 404/403/429/409/network/timeout, and out-of-order runs. Use real public repositories for a found file and a genuinely absent file; verify the inspector's source and commit link. Run build and check no production mock data ships.
  Learner check: Open a real Missing finding, read its rule and next action, then recheck; say whether the distinction between evidence and uncertainty is clear.
  Commit: `Add evidence-backed file findings and real recheck`

- [x] **3. Fashion Noir makes the live inspection readable at a glance**
  Becomes usable: The real report appears in the locked Noir Pink editorial layout and seven-node graphical Inspection Map. Selecting a node opens the Evidence Inspector; desktop and narrow-screen layouts preserve the overview-first journey.
  Why now: The central behavior is already real, so visual and interaction work can be judged against actual states instead of the reference prototype's scenarios. Early learner feedback here can still shape the final presentation.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Live inspection and graphical overview`, `prd.md > Evidence Inspector and rule provenance`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > InspectionMap and StatusSummary`, `spec.md > EvidenceInspector`, `spec.md > RepositoryInput`
  Build: Recreate V1.1's composition, typography, flat palette, orbit, map, and focused inspector using real findings. Remove scenario selector, simulated fix, Blush switch, fabricated data, gradients, green, and italics. Add keyboard access, focus return, state labels/icons, reduced motion, and responsive layout.
  Verify (mechanical): Inspect rendered desktop and phone views, keyboard-only map/inspector flow, focus restoration, contrast/status labels, and reduced motion. Run tests/build; search production source and built output for prototype controls and mock findings.
  Learner check: Compare the live desktop report and a phone-width view with V1.1; identify anything that weakens the intended hierarchy or makes a status hard to understand.
  Commit: `Build Fashion Noir inspection map and evidence interface`

- [x] **4. Human review survives refresh without becoming machine evidence**
  Becomes usable: Video, eligibility, and Devpost-form nodes can be explicitly self-confirmed and undone; declarations persist for the same normalized repository, remain isolated from other repositories, and reset when local data is cleared.
  Why now: Manual review completes the seven-finding product after the machine-evidence path and map exist, without adding accounts or a backend.
  PRD ref: `prd.md > Manual review and self-confirmation`, `prd.md > Five status meanings`, `prd.md > Recheck and changed evidence`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > ManualConfirmationStore`, `spec.md > InspectionMap and StatusSummary`, `spec.md > EvidenceInspector`, `spec.md > Data Model and State Transitions`
  Build: Add localStorage flags keyed by normalized repository identity, reversible controls in manual evidence views, local-only explanatory copy, and independent display composition. Keep machine reports in memory only; a refresh initiates a new live request.
  Verify (mechanical): Test confirm/undo, refresh and equivalent URL persistence, cross-repository isolation, cleared/corrupt/blocked storage, and recheck independence. Verify in a browser that Self-confirmed never enters the Verified count. Run build.
  Learner check: Confirm one manual item, refresh, switch repositories, return, and undo it; describe any point where the label feels like a machine guarantee.
  Commit: `Persist repository-isolated manual confirmations`

- [x] **5. The built app works from its public static URL**
  Becomes usable: A reviewer can open the GitHub Pages URL and run the full live preflight flow without an account or key, in addition to local use and the required later demo video.
  Why now: Hosting is the final end-to-end integration gate; it should expose asset-path, browser, and API failures after the product behavior is complete.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Acceptance Criteria`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Test Strategy and Implementation Order`, `spec.md > Important Failure Modes`
  Build: Add the GitHub Pages workflow and exact Vite base path for the project URL, factual README run instructions, and a minimal verification record. Publish only with the user's authorization for the public repo/push; local production preview remains a valid partial check until then.
  Verify (mechanical): Run all tests and production build; inspect `dist/` asset paths and production preview. If published, verify direct load and refresh with `?repo=`, JS/CSS/font loading, live API behavior, Safari desktop, phone layout, and visible failure states on Pages. Record actual results and anything unverified.
  Learner check: Open the deployed URL (or local production preview if publication is pending), run the full finding → evidence → recheck flow, and note any confusing or broken step.
  Commit: `Prepare and verify static deployment`

## Hands-on Checkpoints

- [x] Early usable behavior feedback received — the learner accepted the local MVP before public release; no detailed firsthand interaction log was supplied.
- [x] Final live-version review and feedback completed — the learner accepted the deployed functionality and design on 2026-10-23 and requested no changes. Agent-run Safari and API checks are recorded separately in `build-verification.md`; no specific learner click path is claimed.

## Final Review

- [x] Final review complete — the learner explicitly authorized ending `$5-build` on 2026-10-23, with no new feature requests and Fashion Noir V1.1 still locked.

## Code Tour and App Map

- [x] Learning activity complete — a concise evidence-based recap of the complete-tree Missing threshold was delivered; this was not an interactive code tour.
- [x] Optional edit and transfer reflection addressed — no edit was requested or performed; one optional transfer question was offered without requiring an answer.
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: On 2026-10-23, a concise recap connected `scope.md > Failure Principles` and `spec.md > Data Model and State Transitions` to `buildMachineReport` in `src/inspectionEngine.ts`, `tests/inspection.test.ts`, and the live complete one-entry tree of `octocat/Hello-World`. It distinguished a supported `Missing` conclusion from a 404-driven `Unable to verify` result. The reusable practice is to define the evidence threshold for a strong claim before designing its status or UI.
Route and stops: `devpost/app-map.html` provides a verified three-stop reference route through `src/App.tsx`, `src/githubClient.ts` / `src/inspectionEngine.ts`, and the Evidence Inspector. The learner was shown the map; an interactive source walkthrough was not claimed.
Edit outcome: Not applicable; the learner requested no changes and Fashion Noir V1.1 remains locked.
Reflection: One optional transfer question was offered; no response is required or presumed.
Activity mode: concise evidence-based recap for an experienced plan-first learner, not hands-on practice.

## Revisions

- The planned early checkpoint and final kick-the-tires prompts were consolidated in Fast Mode. The learner accepted the local MVP, then explicitly accepted the deployed functionality and design and approved `$5-build` closure. The record does not claim unreported learner interactions; concrete browser checks remain in `build-verification.md`.
- Live publication and verification completed slice 5. No Scope, PRD, Spec, or Fashion Noir behavior changed during closeout.

## $6-ship Handoff — Not Yet Complete

- [ ] Choose and add an open-source `LICENSE` that matches the learner's actual authorization intent. The repository currently has no license file; the official rule treats a license as a recommendation, not an automated ClauseMap failure.
- [ ] Prepare a controlled public test repository and capture a real continuous **Missing → push fix → Re-check → Verified** sequence for the final demo video. The current live evidence proves Missing and Verified on separate public repositories, not that continuous transition.
- [ ] Review final competition materials with the learner before publishing them. No Devpost submission has been made.
