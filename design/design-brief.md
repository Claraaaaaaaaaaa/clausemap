# ClauseMap — Fashion Noir V1.1 / PRD Design Handoff

**Status:** Approved visual reference for PRD exploration. **Not production functionality.**  
**Project:** Build With AI: Basics / Submission Preflight Inspector  
**Source of truth for feature scope:** `devpost/scope.md` (approved in the user's local ClauseMap project).  
**Companion visual reference:** `fashion-noir-v1.1.html` (interactive, simulated data).

## Product goal
Help a hackathon participant review a public GitHub repository against a narrow set of official submission requirements. Keep the first impression striking, the result understandable at a glance, and detailed evidence available only when requested.

## Locked visual decisions
- **Fashion Noir / black and pink:** flat solid colors (no gradients) and **no green anywhere in the visual theme**.
- **Never use italic typography** (including hero accents, headings, status labels, and evidence). Keep lettering upright.
- Expressive art-directed headline, restrained legible UI. Prefer **Syne / Space Grotesk** as tested candidates; avoid stretched, ultra-condensed, or comically exaggerated display glyphs.
- Bold dark–pink contrast, clean editorial composition, graphic visual hierarchy. Preserve the existing V1.1 composition as reference rather than redesigning from scratch.
- Graphical **Overview first → Details on click**, with strong information reduction and progressive disclosure. Do not replace this with a dense dashboard.
- Delight comes from responsive diagram nodes, selection, and real state changes, not confetti, distracting effects, or invented statistics.

## Key screens and interactions
### 1. Landing / no inspection yet
- Large, confident visual identity with one unambiguous action: input a public GitHub repository URL and run preflight.
- Keep the core message short; do not overwhelm with explanatory text or simulated 'compliance percentages'.
- Decorative orbit graphic may introduce the concept, but must not visually assert that a specific repository was checked.

### 2. Results / inspection overview
- At a glance: machine-verified items, missing items, unknown checks, and items needing human confirmation.
- Status counts are counts of checks, **never an overall compliance score**.
- Interactive node map: Repository → scope/prd/spec file-presence checks → manual review items. Clear labels, readable status, accessible click targets.
- Preserve distinct states: **Verified**, **Missing**, **Unable to verify**, **Needs confirmation**, **Self-confirmed**.
- Statuses use **icons + words + shape or visual grouping**, not color alone. Pink is the brand color, not the only semantic signal.

### 3. Evidence inspector / details on demand
- Starts closed. Selecting a check opens a clearly organized detail panel without losing the overview.
- Provide exact observed outcome, official requirement reference, scope or limitation of the check, and one concrete next step.
- An automatically verified file *exists* does not mean its contents are valid or that it was genuinely produced by the official Skill Pack.
- For human review, self-confirmation must never be upgraded to machine verification.

### 4. Recheck / changed evidence
- After a real repo file fix, a new real inspection can change Missing → Verified based on new evidence.
- Do not hardcode pass states, simulate checks in the production app, or imply all submission requirements are satisfied.
- A loading or API failure must not be interpreted as Missing.

## Critical UX states
- Initial empty state, invalid URL, in-progress check, partial/failed inspection, verified, missing, unknown, manual confirmation, self-confirmed, re-run.
- Keyboard-focus and mobile layouts should remain usable; reduced-motion preference respected.

## PRD acceptance tests (experience, not technical implementation)
1. Within five seconds, a first-time visitor can tell what ClauseMap does and where to paste a GitHub URL.
2. A user can identify an important missing file from the overview without reading the underlying rules.
3. One click reveals the exact observed finding and the requirement source; one clear action explains how to fix it.
4. The user can distinguish five statuses without relying solely on color.
5. A user can tell **simulation** from **real evidence**, and manual claims from machine checks.
6. The layout is comprehensible on desktop and on a narrow mobile viewport.
7. V1.1 visual identity persists: pink + black, no gradients, no green, no italics.

## Scope guardrail
Do not add generalized AI rule parsing, account creation, paid APIs, a database, an auto-submission workflow, or a global compliance certification. The approved `scope.md` controls requirements; PRD defines look, feel, and behavior, not technology choices.

## Reference warning
The HTML is a **design mockup**. It contains simulated scenario and repair behavior. Treat it as a visual/interaction specification only. The production app must replace simulated checks with genuine GitHub-based observations in `$5-build` after the `$4-spec` technical plan.
