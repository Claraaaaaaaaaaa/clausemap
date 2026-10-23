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

## Gate 3 — Fashion Noir interface

Pending implementation and verification.

## Gate 4 — end-to-end and manual review

Pending implementation and verification.

## Gate 5 — production readiness

Pending implementation and verification.
