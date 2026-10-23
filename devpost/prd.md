---
doc: prd
status: approved
---

# ClauseMap — Product Requirements

ClauseMap is a submission preflight inspector for an individual Build With AI: Basics entrant. It checks a public GitHub repository against a narrow set of official requirements, shows the evidence behind each result, and keeps human declarations separate from machine observations. Source: `scope.md > The Unique Kernel`, `Who It's For`, `The POC Boundary — Must Have`.

**Visual reference:** [Fashion Noir V1.1](../design/reference/fashion-noir-v1.1.html) and [design brief](../design/design-brief.md). The reference uses simulated data and does not define production verification behavior.

## The Core Journey

Source: `scope.md > The Core Loop`, `What "Working" Looks Like`.

1. A visitor arrives at a distinct ClauseMap landing view. Within the first glance they understand that this is a final check for a hackathon submission and find one prominent field for a GitHub repository URL plus **Run Preflight**. No repository has been inspected yet.
2. They enter a GitHub repository URL and start the check. The interface acknowledges that a real inspection is in progress and does not present decorative or previous findings as current results.
3. The inspection opens an overview headed by the inspected repository identity and an **Inspection Map**: public repository → three named planning files → three human-review items. A concise summary calls attention to actual missing files or unresolved checks without giving a compliance score or certification.
4. The visitor selects a node. An **Evidence Inspector** reveals its exact status, what was observed or could not be observed, the relevant section of the official rules, the limit of that finding, and one practical next action. The map remains recognizable behind the detail view.
5. For video, eligibility, and Devpost form items, the visitor may explicitly self-confirm an item after reviewing its rule. The map then says **Self-confirmed**, never **Verified**. Their declarations remain available for that same repository after a page refresh or a recheck, and can be undone.
6. The visitor repairs a missing repository file outside ClauseMap, then runs Preflight again. The new observation replaces the former file-presence finding; the updated status is visible in the map and Evidence Inspector. An incomplete or failed recheck cannot turn an unverified file into **Missing** or **Verified**.

## Screens and Layout

Source: `scope.md > Inspiration & Identity`, `The Core Loop`.

- **Landing:** Fashion Noir editorial hero, short value statement, a single GitHub URL field and Run Preflight action. The graphical orbit supports the inspection metaphor but is clearly illustrative before a check; it shows no unlabeled repository-specific result. The landing is initially empty of user data, with no prefilled fictitious URL or theme switch.
- **Inspection overview:** A report header identifies the repository and offers **Run Preflight again** and a way to enter another URL. Immediately below, status summaries and the large graphical Inspection Map communicate the result before detailed prose. Machine checks and human-review nodes are visually grouped. Any counts are labeled counts of findings, not a score; **Missing** and **Unable to verify** are never merged into an unlabeled number.
- **Evidence Inspector:** Selecting any map node opens a focused detail panel with sections in this order: **Observed / Not observed**, **Official requirement**, **What this check proves or cannot prove**, **Next move**. Human-review items also include a clearly labeled self-confirmation control. Closing the panel returns the visitor to the same map context.
- **Responsive layout:** Desktop is primary. On a narrow viewport, content stacks while preserving the readable order of overview → map → detail. All seven findings remain discoverable without relying on tiny diagram labels or hover.

## Look and Feel

Source: `scope.md > Inspiration & Identity`; locked direction from `design/design-brief.md` and Fashion Noir V1.1.

- Use **only the Noir Pink presentation** from V1.1: bold, flat black-and-pink editorial composition, strong type hierarchy, graphical Inspection Map, and overview-first rhythm. The Blush variant remains a historical design reference, not a production theme or toggle. The interface should feel like a precise preflight instrument, not a chat window or generic SaaS dashboard.
- Use upright, expressive display typography with restrained, legible supporting text. **Syne** and **Space Grotesk** are the tested font candidates. No italic text, gradients, or green in the visual theme.
- Pink is a brand accent, not a universal success/failure color. Every state uses its full name plus a distinct icon or marker and sufficient visual separation. Text, contrast, focus, and touch targets must remain understandable without color perception or animation.
- Motion is limited to purposeful selection, panel opening, and genuine state changes. Loading indicates actual work; no fabricated progress or celebratory effect. Reduced-motion preference is respected.

## Features and Behavior

### GitHub URL entry and first use

Implements `scope.md > The Core Loop`, `The POC Boundary — Must Have`.

- Before a check, the page presents one clearly labeled public GitHub repository URL field and one primary action. It does not show a current-status report for a fictitious repository.
- An empty or malformed URL produces an inline **Unable to verify** input state explaining what kind of link is needed. The field remains editable and in context; no file-level **Verified** or **Missing** verdict appears because no inspection occurred.
- A valid-looking URL starts a fresh real inspection. A syntactically valid link that cannot be reached is handled as **Unable to verify**, not as a missing document.

### Live inspection and graphical overview

Implements `scope.md > The Unique Kernel`, `The Core Loop`, `Failure Principles`.

- The only automatic claims are public GitHub repository accessibility and presence of files named `scope.md`, `prd.md`, and `spec.md`. The root and `devpost/` are likely locations, not the only valid ones. A found file anywhere in the inspected repository can support a file-presence finding.
- **Missing** requires reliable coverage sufficient to establish absence across the repository. If coverage is incomplete or uncertain, that file is **Unable to verify**. A private or nonexistent repository never produces a missing-file claim solely from access failure.
- The map contains one node per automatic check and one per human-review item: repository, scope, PRD, spec, video, eligibility, Devpost form. It shows the status word directly on or next to each node, with machine and human groups visibly distinct.
- An overview headline describes the observed situation in plain language and avoids implying overall readiness. If summary counts appear, they count checks in explicitly named states; they do not conflate **Missing** with **Unable to verify** or human declarations with **Verified**.
- The production report has no mock scenario selector, simulated repair button, fabricated repository result, or demo-only pass animation. No simulated observation or transition from the reference HTML may enter the production inspection logic or appear as a live finding.

### Five status meanings

Implements `scope.md > The POC Boundary — Must Have`, `Failure Principles`.

| Status | Meaning shown to the visitor | Allowed for |
| --- | --- | --- |
| **Verified** | A specific machine claim has real, inspectable supporting evidence. | Public repository access or named file presence only. |
| **Missing** | A required named file was absent after reliable, sufficiently complete inspection. | Planning-document presence checks only. |
| **Unable to verify** | Access, permission, rate limit, network issue, incomplete response, or other uncertainty prevents a reliable conclusion. | Affected machine checks. |
| **Needs confirmation** | The app cannot establish the requirement from the GitHub repository and awaits the entrant's review. | Video, eligibility, Devpost form. |
| **Self-confirmed** | The entrant says they checked or completed it; ClauseMap has not independently verified it. | Human-review items only. |

A node never changes from **Needs confirmation** to **Verified** by user action. A new machine status requires a new actual observation. Verified file presence does not assert document validity, authorship, or whole-submission compliance.

### Evidence Inspector and rule provenance

Implements `scope.md > The Unique Kernel`, `The Core Loop`.

- Every node opens a detail panel that identifies the exact claim being assessed. A verified file shows the observed file path and a way to inspect that public file. A missing file explains that absence was concluded from sufficiently complete coverage. An unable-to-verify result explains what prevented a conclusion, without guessing that a repository is private or nonexistent.
- Each detail links to the relevant section of the [Build With AI: Basics Official Rules](https://learn-ai-basics.devpost.com/rules), distinguishes mandatory wording from recommendations, and names the limit of the check. The repository node cites **Submission Requirements**; document nodes cite **Project Requirements → What to Create**; human-review nodes cite their corresponding official sections.
- The next action is specific to the state: add and publish a missing file, retry an unverified check, inspect a verified file's contents yourself if needed, or complete a human review. Opening evidence does not itself change a status.
- The panel is dismissible with a visible close action and keyboard controls; focus returns to the selected node. The rule link remains usable on mobile and with a keyboard.

### Manual review and self-confirmation

Implements `scope.md > The POC Boundary — Must Have`, `Acceptance Criteria`.

- Video, entrant eligibility, and the Devpost form start as **Needs confirmation**. Each has its own official-rule context and explains why a GitHub inspection cannot prove it.
- The entrant may explicitly mark each item **Self-confirmed** and may undo that declaration. The label always states that it is self-reported, never machine-verified. These items do not contribute to a claim of overall compliance.
- Declarations are kept locally in the visitor's browser for the same normalized GitHub repository identity, surviving a page refresh and a fresh preflight. Equivalent URLs for the same repository refer to the same declarations. A different repository never inherits them; returning to a previously reviewed repository can restore its own declarations. Undoing a declaration returns that item to **Needs confirmation** and remains undone after refresh.
- If local data is absent, cleared, or unavailable, each human-review item starts as **Needs confirmation**. The interface never infers a declaration from repository data or claims one was preserved when it was not. Local declarations do not sync across browsers or devices.
- A mandatory requirement and a recommendation must not be presented with equal enforcement language. No automated license warning or video-length verdict is added to this MVP.

### Recheck and changed evidence

Implements `scope.md > The Core Loop`, `What "Working" Looks Like`.

- **Run Preflight again** performs a fresh inspection of the same repository. While it runs, current machine verdicts are withheld or explicitly labeled as results from the previous check; none are presented as fresh observations.
- When new findings arrive, the map and Evidence Inspector show their new statuses and supporting observations. A repaired file may move **Missing → Verified** only when the fresh inspection actually finds it.
- A failed or partial recheck shows **Unable to verify** for affected checks, with an explanation and a retry action. Successfully checked findings can still display their own evidence; one failure does not erase unrelated valid observations.

## States and Boundaries

- **No inspection yet:** Hero and URL input are visible. Any illustrative orbit conveys the concept without claiming real results.
- **Checking:** Clear busy state and progress wording without invented percentages. Duplicate starts are prevented, and no result is represented as current until observed.
- **Invalid input:** Inline Unable to verify guidance; URL can be corrected immediately, and no repository inspection is implied.
- **Repository unavailable or ambiguous:** Repository and dependent file checks show **Unable to verify**. The explanation avoids asserting private versus nonexistent if the evidence cannot distinguish them.
- **Incomplete file coverage:** A found file can be shown as present when individually evidenced; files not found remain **Unable to verify**, never **Missing**.
- **Partial inspection:** Each node keeps its own supported status. The overview signals partial results without an overall pass/fail claim.
- **All named files found:** Automatic nodes may be Verified; the page still shows human-review work and states that file presence is a limited check.
- **Human review:** Needs confirmation or Self-confirmed remains visually separate from machine results.
- **Refresh or recheck of the same repository:** Human declarations are restored for that repository; any machine verdict still requires its own real inspection and is not made current by stored manual data.
- **Different repository:** Starting over with another URL does not carry over the former repository's machine findings or human declarations as current results. Returning to the original repository may restore only its own local declarations.
- **Local data missing or cleared:** Human-review items return to Needs confirmation, without an implied prior confirmation.

## Acceptance Criteria

1. On first load, a visitor can identify the product purpose and primary GitHub URL action without seeing a fabricated current report.
2. A valid public repository produces seven understandable findings: four machine checks and three human-review items. A file found outside root or `devpost/` is not wrongly marked Missing.
3. A truly absent named file is marked Missing only after sufficiently complete inspection; its node opens the observed basis, official rule, limitation, and repair action.
4. An invalid URL produces inline Unable to verify guidance without a file verdict. Inaccessible repositories, rate limits, and incomplete inspections produce Unable to verify outcomes for affected checks; none are falsely labeled Missing or Verified.
5. A manual item moves Needs confirmation → Self-confirmed only after explicit user action, can be undone, and never appears in the Verified count.
6. Self-confirmed items remain self-confirmed after refreshing or rechecking the same repository, including when its URL is entered in an equivalent form. Switching to a different repository shows only that repository's declarations; clearing local data returns items to Needs confirmation. Undoing a declaration persists after refresh.
7. After a real repository fix, a fresh recheck changes the relevant node to Verified only when it finds the file. The Evidence Inspector shows the new path/observation; the recheck never upgrades Self-confirmed to Verified.
8. Every node is keyboard-operable, its status is distinguishable without color alone, the detail panel can be dismissed, and desktop and narrow mobile layouts preserve the core journey.
9. No screen presents a total compliance score, overall certification, or a simulated inspection result as a live one. The sole production theme is Noir Pink, with no switch, gradients, green, or italics.

## Product Decisions

- The learner chose **Fashion Noir V1.1's Noir Pink presentation as the only production theme**: black and pink, no gradients, green, or italics; graphic Inspection Map and an Evidence Inspector opened on selection. The Blush theme and switch are outside this MVP.
- The learner chose **overview first, details on click** so the report reads quickly while every conclusion remains inspectable.
- The learner chose a real failure → fix → recheck demonstration and rejected simulation as production behavior.
- The learner kept the MVP to this competition, a GitHub URL, four automatic checks, and three human-review items; no overall certification claim.
- The learner chose browser-local, repository-isolated persistence for self-confirmations across refresh and recheck, with explicit undo. These declarations never become machine evidence and disappear when local data is cleared.

## What We're Building

The Noir Pink landing, live preflight report, seven-node Inspection Map, Evidence Inspector, five trustworthy statuses, repository-isolated local manual confirmation, and real recheck loop described above. The first version is primarily for desktop browsers with a usable narrow-screen layout.

## Deferred From the POC

Automatic assessment of document contents, video, personal eligibility, and Devpost submission status; arbitrary-rule ingestion; other code hosts and competitions. Each needs evidence or broader product design beyond the chosen loop.

## Non-Goals

No theme switch, login, backend database, cross-device sync, paid AI API, generic RAG, auto-submission, fabricated result or repair control, global readiness score, or compliance certification. A license recommendation is not a mandatory-file failure.

## Open Questions

No product-defining questions remain. `4-spec` will choose and verify the repository-identity normalization and browser-local persistence details, alongside the live repository inspection method.
