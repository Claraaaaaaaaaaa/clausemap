---
doc: spec
status: approved
---

# ClauseMap — Technical Spec

## How This Works, In Plain Language

ClauseMap is a static browser app. A visitor enters a public GitHub repository URL; the app asks GitHub for that repository's public metadata and a snapshot of its default branch's file tree. It checks only whether three exact file names appear. A complete tree can prove a name is absent; an incomplete tree cannot. Every result carries its observation and the matching official rule into the Inspection Map and Evidence Inspector. The browser keeps only the visitor's own manual confirmations for each repository. Refreshing runs a new GitHub inspection rather than replaying a saved machine verdict.

This keeps the proof of concept to one website and one external data source. There is no app server, account, secret, AI API, or database. The tradeoff is GitHub's unauthenticated rate limit and the possibility of an incomplete tree; those become **Unable to verify**, never fabricated pass or fail results.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. **Enter:** `RepositoryInput` validates a `github.com/owner/repo` URL and derives a normalized repository key. Invalid input stays on the landing with inline **Unable to verify** guidance; it makes no request.
2. **Inspect:** `InspectionController` starts a new request generation, clears any claim that an old report is current, and calls `GitHubClient`. The client obtains public repository metadata and its `default_branch`, resolves that branch to one commit SHA and its root tree SHA, then requests that exact tree SHA recursively. The commit, tree, and all file findings belong to this one inspection snapshot even if the branch later moves. Each network stage has a timeout.
3. **Decide:** `InspectionEngine` turns only validated observations into the four machine findings. Exact named regular files found in the snapshot become **Verified** for *presence only*. An absent name becomes **Missing** only if the tree response is complete and trustworthy. In all other cases the affected claim is **Unable to verify**.
4. **Explain:** Static `ruleCatalog` entries attach the relevant official section and its mandatory wording to each finding. `InspectionMap` gives the seven-node overview. `EvidenceInspector` shows the observed path or inability to observe, snapshot identity, rule, limitation, and next action.
5. **Confirm:** `ManualConfirmationStore` restores three independent declarations for the normalized repository key. Toggling one records or removes a self-report. It never writes into a machine finding.
6. **Repair and recheck:** The visitor changes the public repository outside ClauseMap. **Run Preflight again** repeats steps 2–4 against a new default-branch commit. A fresh observation may change **Missing → Verified**; an API failure becomes **Unable to verify**. The manual declarations remain for that repository.

## Stack

**Learner-approved architecture:** Vite + React + TypeScript, custom CSS, browser `fetch`, browser `localStorage`, and Vitest for the small set of trust-critical logic tests. Use current stable package releases pinned in the lockfile at build time; avoid extra UI, state, animation, routing, or API client libraries. Vite currently requires Node.js **20.19+ or 22.12+**; use Node 22 LTS if available. [Vite getting started](https://vite.dev/guide/), [React interactivity](https://react.dev/learn/adding-interactivity), [Vitest guide](https://vitest.dev/guide/).

React is proportionate here because one inspection updates the map, counts, drawer, and retry view together; TypeScript makes the five statuses and evidence shapes explicit. The tradeoff is a small build step and dependency install. All presentation CSS is custom so the locked visual is not replaced by a component kit. The browser calls GitHub directly; [GitHub documents CORS support](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests), but this exact flow still needs a browser probe early in `5-build`.

## Where It Runs and How Someone Tries It

- **Local:** Browser plus Node 22 LTS and npm. Planned commands: `npm ci`, `npm run dev`; open `http://localhost:5173/`. No API key, login, or server configuration for a visitor. A public GitHub URL and internet connection are needed for a live inspection. `npm run test` and `npm run build` are required build checks.
- **Free deployment target:** GitHub Pages from this project's public repository, publishing Vite's static `dist/` through a GitHub Actions workflow. Configure Vite `base` for the actual project path (`/<repo>/` for project Pages, `/` for a user/organization Pages root), use no client-side path router, and verify the emitted asset URLs on the deployed site. After enabling Pages, open the URL shown in repository Settings → Pages (normally `https://<owner>.github.io/<repo>/`). GitHub documents [free Pages availability for public repositories](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) and [Vite's static deployment process](https://vite.dev/guide/static-deploy.html). Deployment shares the app; the short demo video and public code repository remain required submission deliverables.
- **Demo:** Record a live public test repository with one document absent; add and push that file; click Run Preflight again and show its new evidence. Also show an inaccessible/limited case and a manual **Self-confirmed** item. Test fixtures may simulate API responses in tests, but the app and submitted video must label any non-live material and must never present it as a real check.

## Look and Feel

Implements `prd.md > Look and Feel`, `Screens and Layout`. Use the [V1.1 Noir Pink reference](../design/reference/fashion-noir-v1.1.html) and [design brief](../design/design-brief.md) for composition and hierarchy. Recreate the dark background, flat pink accent, large upright display type, orbit illustration, graphical Inspection Map, and sliding Evidence Inspector. Use Syne / Space Grotesk with sensible local fallbacks. **No Blush toggle, gradients, green, or italics.** Keep the orbit purely illustrative before inspection; remove the reference HTML's prefills, scenario selector, simulated repair, fabricated results, and simulation logic. State change motion must reflect actual data; respect reduced motion, visible keyboard focus, legible labels, and mobile layouts.

## Components

### RepositoryInput

Implements `prd.md > GitHub URL entry and first use`, `Screens and Layout`. Displays the landing input and error. Parser accepts `https://github.com/owner/repo` and a bare `github.com/owner/repo`, optional trailing slash and `.git`; it rejects other hosts, credentials, extra path segments, and malformed owner/repo values. Strip benign query/fragment for identity, lowercase owner/repo for a stable key, and display the normalized target before inspection. The app constructs all API URLs from validated segments and a fixed `api.github.com` host, never fetches an arbitrary submitted URL.

### GitHubClient

Implements `prd.md > Live inspection and graphical overview`, `States and Boundaries`. Issues the three documented public REST GET requests in sequence, with `Accept: application/vnd.github+json`, `cache: 'no-store'`, and no custom API-version header. GitHub currently documents unversioned requests as using the supported `2022-11-28` version; omitting the non-safelisted custom header avoids relying on an unverified browser CORS preflight. No token is stored or sent. Returns typed responses or a typed failure with request stage and cause. It validates HTTP status and required fields, uses an abortable 10-second timeout per stage, and reads rate-limit headers when accessible. Repository metadata supplies the canonical identity and default-branch name; the commit response supplies the immutable commit SHA and its root tree SHA; the tree response must identify the requested tree SHA. A branch update between the metadata and commit calls is harmless once the commit has been resolved: no later step reads the moving branch again. It does not treat a 404 as proof of a private or nonexistent repository. See **External Services and Dependencies**.

### InspectionEngine

Implements `prd.md > Five status meanings`, `Live inspection and graphical overview`. Pure logic creates one repository finding and three file-presence findings. The repository is **Verified** only after a successful public metadata response with a public visibility signal; this says nothing about whether its file tree is inspectable. A file is **Verified** only when an entry with `type: 'blob'`, regular-file `mode: '100644' | '100755'`, and its exact basename appears in the fetched, SHA-matched default-branch tree. Prefer root, then `devpost/`, then deterministic path order for the displayed match when duplicates exist; any valid path counts. A file is **Missing** only when the pinned tree response has a valid entry array, its returned SHA matches the requested root tree SHA, `truncated === false`, and no entry of that exact name anywhere. Truncated, malformed, absent, failed, or otherwise incomplete tree data leaves unfound files **Unable to verify**. A found regular file in a truncated but otherwise valid, SHA-matched tree may still be Verified for presence; every unfound file remains Unable to verify. If only a same-named symlink (`mode: '120000'`), submodule, or unsupported entry appears, mark that file **Unable to verify** rather than guessing whether it satisfies the document requirement. Content and Skill Pack authorship are never checked.

### RuleCatalog and EvidenceBuilder

Implements `prd.md > Evidence Inspector and rule provenance`. A small static catalog maps repository-public to **Submission Requirements**, the three document checks to **Project Requirements → What to Create**, and video/eligibility/form to their official sections at `https://learn-ai-basics.devpost.com/rules`. Each entry has a stable rule ID, short paraphrase, `must`/`should` classification, source URL, section label, and a recorded review date. The catalog is based on the official rules reviewed on **2026-10-22**; reconfirm it before shipping, because the official page can change. The open-source license uses `should` and is not an automated failure check. EvidenceBuilder combines only observations from the current run with the finding, path/source, immutable commit and tree SHA where available, observation time, proof limit, and next action. A found file links to `https://github.com/{owner}/{repo}/blob/{commitSha}/{path}` with path segments URL-encoded, so the link is pinned to the inspected commit; a Missing result references the inspected commit/tree rather than a nonexistent file URL. A repository-access finding may carry a metadata observation time without a commit SHA if the later commit request failed. It never claims a file's content or origin was verified.

### InspectionController

Implements `prd.md > Recheck and changed evidence`, `States and Boundaries`. Owns the current repository key, loading/error state, current report, and selected node. Each click on **Run Preflight again** starts a new three-stage GitHub fetch; it never copies the prior report or treats a cached machine result as new evidence. Each run has a monotonically increasing generation ID and abort signal. Starting a recheck or switching repositories invalidates the prior generation; only the latest generation for the currently selected repository may commit a report. Hide the old report during loading, or visibly label it **Previous inspection** with its earlier timestamp; never present it as current. Publish the new report atomically from observations collected within that run; a failed stage may preserve successful observations **from that run only**. On page refresh, `?repo=owner/repo` can restore the repository context and trigger a new request; no machine verdict is restored from browser storage. Switching repositories loads that repository's independent manual flags. Manual Self-confirmed states are outside this generation cycle and cannot affect machine findings.

### InspectionMap and StatusSummary

Implements `prd.md > Live inspection and graphical overview`, `Five status meanings`, `Screens and Layout`. Render the seven labeled nodes in V1.1's hierarchy: repository → three file names → video, eligibility, form. Status words and distinct symbols accompany color. Summary counts are computed from findings, not stored, and never merge Missing with Unable to verify or Self-confirmed with Verified. Buttons, visible focus, logical keyboard order, and a mobile-friendly presentation keep every node reachable. No global readiness score.

### EvidenceInspector

Implements `prd.md > Evidence Inspector and rule provenance`, `Manual review and self-confirmation`. Opens for the selected node and shows its precise status, actual observation or failure reason, immutable snapshot identifiers/path when present, linked official rule, limitation, and next action. Manual nodes show a reversible **I checked this myself** control and a persistent self-report label. The dialog closes by button or Escape, traps focus while open, and restores focus to its originating node. It never substitutes the prototype's sample copy for a real observation.

### ManualConfirmationStore

Implements `prd.md > Manual review and self-confirmation`, `States and Boundaries`. Stores only the three human declarations under a versioned `localStorage` key, partitioned by normalized `owner/repo` identity; no machine results, tokens, or personal eligibility details are stored. Missing, cleared, corrupt, or blocked local storage yields **Needs confirmation**. If a write fails, the control reports that the confirmation could not be saved and does not claim a persistent Self-confirmed state. An explicit uncheck deletes/sets false for that repository and persists. Equivalent input URL forms resolve to the same key; a different repository cannot read the previous key. UI copy makes clear that these declarations live only in this browser and are not independent verification.

## Data Model and State Transitions

```text
RepositoryIdentity = { owner, repo, key: lower(owner) + '/' + lower(repo) }
RuleRef = { id, section, sourceUrl, obligation: 'must' | 'should', reviewedOn }
Observation = { target, outcome, detail, path?, sourceUrl?, commitSha?, treeSha?, checkedAt, coverage: 'complete' | 'incomplete' | 'unavailable' }
MachineFinding = { id: 'repo' | 'scope' | 'prd' | 'spec', status: 'Verified' | 'Missing' | 'Unable to verify', ruleId, observation, limitation, nextAction }
ManualFinding = { id: 'video' | 'eligibility' | 'form', status: 'Needs confirmation' | 'Self-confirmed', ruleId, limitation, nextAction }
MachineReport = { runId, repositoryKey, defaultBranch?, commitSha?, treeSha?, checkedAt, machineFindings[4] }
DisplayedInspection = { machineReport?, manualFindings[3] } // manual findings derive from current repository's local flags
```

`checkedAt` on each observation is when that stage was observed; the machine-report timestamp is when the run finished. `commitSha` and `treeSha` are present only after their responses have been validated. All file observations in a machine report are tied to its single resolved commit and SHA-matched tree, never mixed across runs. Machine findings exist only in current page memory and are replaced by a new run. Manual booleans alone live in localStorage, keyed by repository identity; the display derives manual findings separately so a finishing request cannot overwrite a recent user confirmation. URL query state identifies the repository after refresh but carries no verdict. No server-side data is stored.

| From | Trigger and required evidence | To |
| --- | --- | --- |
| No machine finding / previous finding | New run starts | Checking; previous finding hidden or labeled previous |
| Checking | Public repo metadata observed | Repository **Verified** |
| Checking | Regular named file observed in pinned default-branch tree | File **Verified** (presence only) |
| Checking | Valid complete pinned tree with named regular file absent | File **Missing** |
| Checking | Any failed, ambiguous, rate-limited, or incomplete required observation | Affected machine check **Unable to verify** |
| Needs confirmation | Explicit user check, saved for this repository | Self-confirmed |
| Self-confirmed | Explicit undo or missing/cleared local data | Needs confirmation |

No manual action, saved browser data, animation, or prototype scenario can create **Verified**. A recheck can move any machine status to another only through a fresh observation; a failure cannot preserve a previous Verified as a current claim.

## File Structure

```text
clausemap/
├── index.html                  # Vite app entry; no prototype data
├── package.json                # dev, test, build scripts
├── package-lock.json           # pinned package graph
├── tsconfig*.json              # TypeScript configuration
├── vite.config.ts              # static build and project-path asset base
├── src/
│   ├── main.tsx                # React mount
│   ├── App.tsx                 # current journey and selected repository
│   ├── styles.css              # Noir Pink design, responsive/reduced motion
│   ├── types.ts                 # five statuses, findings, evidence, report
│   ├── rules.ts                 # curated official rule catalog
│   ├── repositoryUrl.ts         # strict parse and normalized identity
│   ├── githubClient.ts          # public REST calls, timeouts, typed failures
│   ├── inspectionEngine.ts      # evidence-to-status decision rules
│   ├── evidenceBuilder.ts       # current-run observations, rule refs, pinned links
│   ├── inspectionController.ts  # fresh runs, abort/generation, stale-result guard
│   ├── manualStore.ts           # repository-isolated local confirmations
│   └── components/
│       ├── RepositoryInput.tsx  # landing and URL error
│       ├── InspectionMap.tsx    # seven-node visual overview
│       ├── StatusSummary.tsx    # evidence-based finding counts
│       └── EvidenceInspector.tsx # selected finding and rule detail
├── tests/                      # API response fixtures and trust-critical tests
├── .github/workflows/pages.yml # static GitHub Pages deploy (if enabled)
├── design/                     # locked brief and simulated reference only
├── devpost/                    # approved scope/PRD and this spec
└── README.md                   # run, evidence limits, and demo instructions
```

## External Services and Dependencies

- **GitHub REST API, public unauthenticated reads:** Browser requests go only to `https://api.github.com`. First `GET /repos/{owner}/{repo}`; require `200`, `private === false` or `visibility === 'public'`, canonical repository identity, and a nonempty `default_branch`. Second `GET /repos/{owner}/{repo}/commits/{default_branch}` with the branch name URL-encoded as a path parameter; require commit `sha` and `commit.tree.sha`. Third `GET /repos/{owner}/{repo}/git/trees/{treeSha}?recursive=1`; require the returned `sha` to equal the requested root tree SHA, a `tree` array, and explicit `truncated` boolean. This is a commit-pinned snapshot: metadata chooses the branch, the commit resolves it once, and the tree is requested by the immutable SHA from that commit. A later branch move cannot silently change a result in progress. The tree endpoint supports unauthenticated public reads; its recursive response is capped at **100,000 entries or 7 MB**, and `truncated: true` means absence cannot be proven. [Repository endpoint](https://docs.github.com/en/rest/repos/repos), [commit endpoint](https://docs.github.com/en/rest/commits/commits), [tree endpoint](https://docs.github.com/en/rest/git/trees).
- **Response contract:** For all stages reject non-2xx, malformed JSON, missing required fields, unexpected response types, or timeout into a typed failure. Preserve the stage, HTTP status when available, accessible rate-limit headers, and observation time. `404` on metadata is ambiguous (nonexistent, nonpublic, or otherwise invisible); repo and files are Unable to verify. `404` after successful metadata does not erase the observed public-repo fact; files are Unable to verify because the commit or tree was not obtained. `403` is classified as primary rate limiting only when headers establish it (for example `x-ratelimit-remaining: 0`), as secondary limiting when response evidence supports that, or otherwise as access forbidden/other API failure; do not claim a specific cause without evidence. `429` is a rate-limit response. Use `retry-after` or rate reset information only when supplied, otherwise give a generic retry-later action. `409` while resolving a commit can indicate an empty repository or another conflict: keep any proven public-repo finding, set files to Unable to verify, and do not call them Missing. Browser `fetch` may not distinguish CORS denial from network failure; show **network or browser access failed** unless a more precise cause is observable. Timeout is a distinct known cause. A valid but truncated tree may verify files it actually lists; unfound names remain Unable to verify. No automatic rapid retry loop.
- **Rate and browser limits:** GitHub documents **60 unauthenticated REST requests per hour per originating IP**, and secondary limits also exist. A normal run uses approximately three requests; shared networks may exhaust the allowance. CORS is officially supported, but validate this exact three-call sequence in an actual browser before committing to the approach. Requests omit `X-GitHub-Api-Version`; GitHub currently defaults these to `2022-11-28`, which its docs list as supported through March 2028. Recheck that contract before release. [Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests), [API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions).
- **Official Devpost rules:** Static reviewed rule text and links in `rules.ts`, sourced from the [Build With AI: Basics Official Rules](https://learn-ai-basics.devpost.com/rules). Review date is metadata, not proof the rules will remain unchanged. Reverify before final submission. No runtime scraping or AI extraction.
- **GitHub Pages:** Proposed static host; no application backend or runtime fee on a public repository. Publishing requires the project owner's GitHub setup, but visitors need no account or API key. [Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Important Failure Modes

- **Invalid URL:** Inline Unable to verify message; no request or file verdict. Only validated `github.com` repository paths proceed.
- **Repository metadata 404:** Say the repository could not be found publicly; it may not exist or may not be visible. Repository and files are Unable to verify, with no claim that it is private.
- **Commit/tree 404 or commit 409 after public metadata:** Keep the repository-access finding Verified with its own metadata evidence; files are Unable to verify. Explain that the branch/commit/tree could not be read, or that GitHub returned a conflict (which can occur for an empty repository), without inferring absent files.
- **403 / 429:** Distinguish a proven primary or secondary rate limit from an otherwise forbidden/API-error response using status, accessible headers, and response evidence. All affected findings are Unable to verify, with an appropriate retry or access explanation.
- **Network, CORS, timeout, or malformed response:** Unable to verify for affected findings. Do not claim to distinguish CORS from network failure when `fetch` exposes only a generic error. Never fall back to prototype results.
- **Incomplete tree:** `truncated: true`, missing `truncated`, SHA mismatch, malformed entries, or an unavailable default-branch tree cannot prove absence. Only regular files actually observed in an otherwise valid SHA-matched tree may be Verified; all unfound names are Unable to verify. Do not attempt an unbounded fallback traversal in the MVP.
- **Out-of-order runs:** Cancel/invalidate previous request when URL changes or a recheck starts; stale response cannot overwrite a newer report or another repository's manual flags. Report evidence and timestamps belong only to its own run.
- **Local storage unavailable/corrupt/cleared:** Manual items return to Needs confirmation. Machine evidence remains unaffected and is never read from storage.

## Test Strategy and Implementation Order

1. **First `5-build` technical validation — real browser API probe:** Before app implementation or UI polish, use a real browser on localhost to confirm public CORS calls, metadata → default-branch commit → exact-SHA tree fields, branch names with slashes, returned-tree SHA equality, and `truncated` interpretation using at least one real public repository. Record the observed HTTP/status/field behavior in build verification. If this fails, revise the spec before implementing the visual report; do not replace live inspection with demo data.
2. **Unit tests (Vitest, fixture responses):** Exact URL acceptance/rejection and identity equivalence; repository/file finding transitions; root, `devpost/`, and other subdirectories; duplicate names; complete absence versus truncated/malformed/SHA-mismatched tree; found-in-truncated versus unfound-in-truncated; metadata 404 versus later-stage 404; 403 primary-limit versus other forbidden response; 429, commit 409, network/CORS, and timeout; two overlapping runs with older response arriving last; fresh recheck without inherited machine evidence; manual store isolation, refresh restoration, undo, and cleared/corrupt storage. Fixtures are confined to tests.
3. **Integrated browser checks:** Enter a real public repo with all files and a real public repo missing a file; inspect source path/rule/limitation in the drawer. Use an owned disposable public repo to demonstrate missing → add/push → real recheck → Verified. Use controlled failure responses for hard-to-trigger rate/truncation cases, clearly within tests only. Check an inaccessible URL without inferring private versus nonexistent.
4. **Experience checks:** Keyboard-only map/drawer/control path, focus return, status distinctions without color, reduced motion, narrow mobile viewport, and no overflow or unreadable map labels. Confirm that initial orbit and deployed build contain no fictitious current report, scenario picker, or simulated repair control.
5. **Production and release checks:** `npm run test` and `npm run build`; open the built site and inspect one real repo on localhost and on GitHub Pages. On the deployed project URL verify the exact Vite `base` path, JS/CSS/assets and Syne/Space Grotesk font loading (or declared fallbacks), direct load and browser refresh with `?repo=`, desktop Safari, narrow phone layout, live GitHub request sequence, and visible 404/403/429/network/timeout handling. Check the browser network panel for real API responses and absence of prototype-result fallback. Recheck the official rules mapping and the public demo video's claims before shipping.

The first usable build slice should include a real URL → real public-repo observation → visible evidence path; subsequent slices can add complete-tree document decisions, the graphical map/inspector, then persistent manual review and final visual/accessibility polish. This is an order for `5-build` to turn into its approved checklist, not permission to start building here.

## PRD Acceptance Coverage

| `prd.md > Acceptance Criteria` | Build home and decisive check |
| --- | --- |
| 1 — first impression, no fake report | `RepositoryInput`, Noir Pink landing; first-load browser check |
| 2–3 — seven findings, nested files, defensible Missing, evidence | `GitHubClient`, `InspectionEngine`, `InspectionMap`, `EvidenceInspector`; complete-tree and nested-path tests plus live repo check |
| 4 — invalid/inaccessible/rate-limited/incomplete outcomes | `RepositoryInput`, `GitHubClient`, `InspectionEngine`; failure fixtures and browser check |
| 5–6 — manual state, persistence, isolation, undo | `ManualConfirmationStore`, `EvidenceInspector`; refresh, equivalent-URL, cross-repo, cleared-storage tests |
| 7 — real repair and recheck | `InspectionController`, `EvidenceBuilder`; owned public fixture repo with add/push/recheck |
| 8 — keyboard, color-independent status, mobile | `InspectionMap`, `EvidenceInspector`, `styles.css`; keyboard and narrow-viewport review |
| 9 — no score/simulation, one locked theme | `StatusSummary`, `styles.css`, production artifact inspection |

## What Was Simplified and Why

- **Browser-to-GitHub reads** instead of a proxy/backend — free deployment and no user credentials. Accepted limitation: anonymous rate limits can yield Unable to verify.
- **One recursive tree request** instead of exhaustive subtree pagination — a complete response proves absence; truncation is explicitly unknown. This preserves truthfulness while keeping the POC small.
- **Static curated rules** instead of arbitrary AI rule extraction — exact provenance for this competition, without a paid model or untestable interpretations.
- **Only manual booleans in localStorage** instead of accounts or sync — preserves the approved same-browser experience without storing machine claims.

## Decisions and Open Issues

- **Learner choices carried forward and approved:** one real GitHub-only workflow; no credentials for visitors; Noir Pink V1.1; browser-local, repository-isolated manual confirmations; no backend database or paid API. See `prd.md > Product Decisions`.
- **Architecture approved in principle by the learner on 2026-10-22:** Vite/React/TypeScript static app, direct unauthenticated GitHub REST calls, browser-local manual flags, and free GitHub Pages deployment. Reason: minimal infrastructure while supporting a coordinated graphical UI. Accepted tradeoff: anonymous rate limits and possible incomplete trees must surface as Unable to verify, not fabricated verdicts. The learner conditionally authorized final spec approval once the evidence, failure, recheck, and deployment contracts were made explicit; this document records that completed review.
- **Useful known uncertainty:** whether a complete default-branch file tree can be obtained reliably without auth or a backend. GitHub's [tree documentation](https://docs.github.com/en/rest/git/trees) provides a `truncated` signal and size limit; the browser/CORS and exact three-call behavior remain an early `5-build` probe. If the probe fails, revisit the architecture with the learner before altering the kernel or claiming Missing.
- **Remaining technical validation, not a product choice:** the real-browser three-call probe, practical tree completeness on representative repositories, and GitHub Pages/Safari verification are the first build and release gates. Failure would require revisiting the architecture with the learner before changing the trusted kernel. No unresolved product-defining question remains from `prd.md > Open Questions`.
