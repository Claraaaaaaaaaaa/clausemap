# Build verification record

This file records observations from real checks. Test fixtures used later are identified separately and never supply production findings.

## Gate 1 — real-browser GitHub REST probe

- Browser: Safari on macOS, page origin `http://127.0.0.1:8766`, 2026-10-23 02:53 UTC.
- Request sequence from page JavaScript, with no token and `cache: 'no-store'`: `GET /repos/octocat/Hello-World` → `GET /repos/octocat/Hello-World/commits/master` → `GET /repos/octocat/Hello-World/git/trees/b4eecafa9be2f2006ce1b709d6857b07069b4608?recursive=1` → intentionally nonexistent repository.
- Observed HTTP statuses: `200`, `200`, `200`, `404`. JavaScript read each response body and rate-limit headers, establishing that this exact browser-origin cross-origin flow worked.
- Repository response: `octocat/Hello-World`, `private=false`, default branch `master`.
- Commit response SHA: `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`; its root tree SHA: `b4eecafa9be2f2006ce1b709d6857b07069b4608`.
- Recursive tree response SHA matched the requested root tree SHA; `truncated=false`, one entry (`README`). This establishes full coverage for that snapshot only.
- Nonexistent probe path returned `404`. As designed, this status alone cannot distinguish nonexistent from nonpublic or otherwise invisible repositories.
- Remaining anonymous requests seen on the second probe: `47`, `46`, `45`, `44`. These are observation-time values, not a future quota guarantee.
- Probe file was temporary outside the project and is not part of the app. This evidence proves the approach worked in Safari on that origin and date; it does not prove all browsers, repository sizes, or future GitHub availability.

## Gate 2 — inspection engine

Slice 1 foundation, Safari on `http://127.0.0.1:5173/`, 2026-10-23 02:59 UTC: entered `https://github.com/octocat/Hello-World`; the app rendered `Public repository observed`, default branch `master`, commit `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`, root tree `b4eecafa9be2f2006ce1b709d6857b07069b4608`, one entry, Complete, and a metadata observation time. The result came after a visible in-progress state. `npm run build` passed with Vite 8.3.5 and TypeScript. Document findings are **not implemented or claimed** in this slice.

Slice 2, Safari on `http://127.0.0.1:5173/`, 2026-10-23 03:03–03:04 UTC:

- `Thanatos9404/ruledost` returned four `Verified` machine findings. The `scope.md` inspector observed `devpost/scope.md` at commit `3aacf2c5f5eeb2b8c005c653aeb5c656436f084e`, tree `1192e280682eb44ba5aaef4096e3ceca6eeedd9d`; the displayed GitHub source linked to that exact commit and path. This is a real nested-file case, not a test fixture.
- `octocat/Hello-World` returned repository `Verified` and the three planning files `Missing`. The `spec.md` inspector explained that the complete recursive tree had one entry, cited commit `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`, tree `b4eecafa9be2f2006ce1b709d6857b07069b4608`, the official Project Requirements section, and the concrete add/push/recheck action.
- A real Re-check of `octocat/Hello-World` replaced the report timestamp `03:04:10.656Z` with `03:04:18.221Z`; the same statuses remained because the repository did not change. The controller test also verifies that an older response arriving last cannot overwrite the newer run. A live Missing → fix → Verified sequence still requires an owned public demo repository; no such transition is claimed yet.
- `npm run test`: 19 tests passed in 2 files, using deterministic HTTP fixtures only in tests. Cases cover nested files, complete absence, truncated tree partial presence, symlink, unpinned tree rejection, 404/403/429/409, rate headers, malformed tree, network error, timeout, URL normalization, and out-of-order runs. `npm run build`: passed (TypeScript + Vite 8.3.5).

## Gate 3 — Fashion Noir interface

Slice 3, Safari desktop on `http://127.0.0.1:5173/`, 2026-10-23 03:10–03:12 UTC: the V1.1-inspired Noir Pink landing displayed the large editorial headline, orbit, source URL input, and no fictitious report. Running `octocat/Hello-World` produced a seven-node graphical map with one live `Verified` repository, three live `Missing` files, and three explicitly unverified human-review nodes. The summary separated `Missing` and `Unable to verify` and stated that it is not certification. Opening `spec.md` showed the complete one-entry file-tree observation, pinned commit/tree SHA, official rule link, limitation, and add/push/recheck action. Safari's accessibility tree showed all seven nodes as buttons with status words and the Evidence Inspector as a dialog with initial focus on Close. The rendered desktop report and landing were visually inspected against the locked reference. The production source has no scenario selector, simulated fix, Blush switch, fabricated finding fixture, gradient, or italic CSS. Reduced-motion CSS suppresses animation and transitions.

`npm run test`: 19 tests passed in 2 files. `npm run build`: TypeScript and Vite passed. A narrow-screen browser check and final keyboard focus-return check remain part of Gate 5; CSS mobile breakpoints are present but are not yet claimed as browser-verified.

## Gate 4 — end-to-end and manual review

Safari on `http://127.0.0.1:5173/`, 2026-10-23 03:14–03:15 UTC: entering `octocat/Hello-World` produced a real commit-pinned report; selecting the Demo video node opened official-rule context and an explicit self-report checkbox. Checking it changed only that node to `Self-confirmed`; the machine `Verified` count remained 1. Escape closed the inspector and returned keyboard focus to the selected map node. Reloading `?repo=octocat%2FHello-World` triggered a new live machine scan (timestamp changed from 03:14:32 to 03:14:54 UTC) while preserving the local declaration. Switching to `Thanatos9404/ruledost` produced four machine-Verified nodes and three `Needs confirmation` human nodes, proving the previous declaration did not transfer. Returning through an equivalent case/`.git` URL restored the original repo's declaration, and unchecking it returned to `Needs confirmation`.

`npm run test`: 21 tests passed in 3 files, including storage isolation, equivalent URLs, undo, cleared storage, corrupt storage, and write failure. `npm run build`: TypeScript and Vite passed. Production machine reports are never stored in localStorage; URL state carries only repository identity.

## Gate 5 — production readiness

Local production preparation, 2026-10-23 03:17–03:19 UTC:

- `VITE_BASE_PATH=/clausemap/ npm run build` passed TypeScript and Vite. Emitted `dist/index.html` points to `/clausemap/assets/...` for JavaScript and CSS. The Google Fonts link is external with local font fallbacks. A source/bundle search found no prototype scenario selector, simulated repair, fabricated demo repository, Blush theme, or gradient function.
- `VITE_BASE_PATH=/clausemap/ npm run preview -- --host 127.0.0.1` served the actual project path. Safari loaded `http://127.0.0.1:4173/clausemap/?repo=octocat%2FHello-World` on direct navigation and refresh, executed a new GitHub scan, and showed the correct real report. The first preview attempt omitted `VITE_BASE_PATH` and produced a blank page at the project path; restarting preview with the same base as the build resolved it. README now gives the correct paired commands.
- Safari Responsive Design Mode at a 390×844 CSS viewport showed the five separate status counts, seven readable map nodes in a mobile grid, and the full-width Evidence Inspector. The drawer opened from a real Missing node and retained its rule, SHA, and action. This is Safari's responsive viewport, not a physical-phone or iOS Safari test.
- A production-preview request for an intentionally unavailable public URL returned four `Unable to verify` machine findings, zero Missing/Verified, and an inspector explaining that GitHub's 404 does not establish whether the repo is nonexistent or invisible. No fallback mock appeared.
- `npm run test`: 21 tests passed in 3 files. GitHub Pages workflow YAML parsed locally and follows Vite/GitHub's documented project Pages deployment pattern. The live GitHub Actions run, public Pages URL, and actual deployed-site refresh remain unverified because no remote or public release has been authorized. An owned public repo is also still needed to film a real Missing → fix → Verified transition.
- Final local rerun at 03:20 UTC: 21 tests passed and the project-path production build passed. At this point, no remote operation had been attempted.

## Public-release gate, 2026-10-23 03:46 UTC

- Reviewed all 29 tracked paths and all six earlier commits plus the safety-cleanup commit before publication. No tracked or historical `devpost/learner-profile.md`, `.env*`, credentials, private keys, private contact details, or local absolute paths were found. Official planning documents remain tracked. The preserved HTML reference explicitly contains simulated prototype interactions; production `src/` and `index.html` have no mock-result fallback.
- `agent/`, `.agents/`, `.claude/`, and `skills-lock.json` are local Skill Pack installation material, not required submission artifacts. They remain on disk but are ignored and untracked. The ignored `node_modules/` test-token file is also not tracked.
- `Claraaaaaaaaaaa/clausemap` was not found through the connected GitHub metadata check. An official `gh auth login -h github.com -w` device flow reached GitHub CLI's OAuth authorization page, but account authorization was not completed. No remote repository, push, Pages setting, or deployment was attempted.
- Final rerun: 21 tests passed; `VITE_BASE_PATH=/clausemap/ npm run build` passed. Public Pages and live production behavior remain unverified.
